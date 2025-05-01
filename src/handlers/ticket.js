const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");
const { TICKET } = require("@root/config.js");

// schemas
const { getSettings } = require("@schemas/Guild");

// helpers
const { postToBin } = require("@helpers/HttpUtils");
const { error } = require("@helpers/Logger");

const OPEN_PERMS = ["ManageChannels"];
const CLOSE_PERMS = ["ManageChannels", "ReadMessageHistory"];
/**
 * @param {import('discord.js').Channel} channel
 */
function isTicketChannel(channel) {
  return (
    channel.type === ChannelType.GuildText &&
    channel.name.startsWith("tіcket-") &&
    channel.topic &&
    channel.topic.startsWith("tіcket|")
  );
}

/**
 * @param {import('discord.js').Guild} guild
 */
function getTicketChannels(guild) {
  return guild.channels.cache.filter((ch) => isTicketChannel(ch));
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} userId
 */
function getExistingTicketChannel(guild, userId) {
  const tktChannels = getTicketChannels(guild);
  return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
}

/**
 * @param {import('discord.js').BaseGuildTextChannel} channel
 */
async function parseTicketDetails(channel) {
  if (!channel.topic) return;
  const split = channel.topic?.split("|");
  const userId = split[1];
  const catName = split[2] || "Default";
  const user = await channel.client.users.fetch(userId, { cache: false }).catch(() => {});
  return { user, catName };
}

/**
 * @param {import('discord.js').BaseGuildTextChannel} channel
 * @param {import('discord.js').User} closedBy
 * @param {string} [reason]
 */
async function closeTicket(channel, closedBy, reason) {
  if (!channel.deletable || !channel.permissionsFor(channel.guild.members.me).has(CLOSE_PERMS)) {
    return "MISSING_PERMISSIONS";
  }

  try {
    const config = await getSettings(channel.guild);
    const messages = await channel.messages.fetch();
    const reversed = Array.from(messages.values()).reverse();

    let content = "";
    reversed.forEach((m) => {
      content += `[${new Date(m.createdAt).toLocaleString("en-US")}] - ${m.author.tag}\n`;
      if (m.cleanContent !== "") content += `${m.cleanContent}\n`;
      if (m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
      content += "\n";
    });

    const logsUrl = await postToBin(content, `Ticket Logs for ${channel.name}`);
    const ticketDetails = await parseTicketDetails(channel);

    const components = [];
    if (logsUrl) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Transcript").setURL(logsUrl.short).setStyle(ButtonStyle.Link)
        )
      );
    }

    if (channel.deletable) await channel.delete();

    const embed = new EmbedBuilder().setAuthor({ name: "Ticket Closed & deleted" }).setColor(TICKET.CLOSE_EMBED);
    const fields = [];

    if (reason) fields.push({ name: "Reason", value: reason, inline: false });
    fields.push(
      {
        name: "Opened By",
        value: ticketDetails.user ? ticketDetails.user.tag : "Unknown",
        inline: true,
      },
      {
        name: "Closed By",
        value: closedBy ? closedBy.tag : "Unknown",
        inline: true,
      }
    );

    embed.setFields(fields);

    // send embed to log channel
    if (config.ticket.log_channel) {
      const logChannel = channel.guild.channels.cache.get(config.ticket.log_channel);
      logChannel.safeSend({ embeds: [embed], components });
    }

    // send embed to user
    if (ticketDetails.user) {
      const dmEmbed = embed
        .setDescription(`**Server:** ${channel.guild.name}\n**Category:** ${ticketDetails.catName}`)
        .setThumbnail(channel.guild.iconURL());
      ticketDetails.user.send({ embeds: [dmEmbed], components }).catch((ex) => {});
    }

    return "SUCCESS";
  } catch (ex) {
    error("closeTicket", ex);
    return "ERROR";
  }
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').User} author
 */
async function closeAllTickets(guild, author) {
  const channels = getTicketChannels(guild);
  let success = 0;
  let failed = 0;

  for (const ch of channels) {
    const status = await closeTicket(ch[1], author, "Force close all open tickets");
    if (status === "SUCCESS") success += 1;
    else failed += 1;
  }

  return [success, failed];
}

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTicketOpen(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const { guild, user } = interaction;

  if (!guild.members.me.permissions.has(OPEN_PERMS))
    return interaction.followUp(
      "Cannot create ticket channel, missing `Manage Channel` permission. Contact server manager for help!"
    );

  const alreadyExists = getExistingTicketChannel(guild, user.id);
  if (alreadyExists) return interaction.followUp(`You already have an open ticket`);

  const settings = await getSettings(guild);
  // Retrieve the category ID from guild settings
  const categoryId = settings.ticket.category_channel;

  // Get the category channel by ID
  const categoryChannel = guild.channels.cache.get(categoryId);

  // Ensure that the category channel exists and is a category
  if (!categoryChannel || categoryChannel.type !== 4) {
    return interaction.followUp("Invalid category ID set for ticket creation.");
  }
  // limit check
  const existing = getTicketChannels(guild).size;
  if (existing > settings.ticket.limit) return interaction.followUp("There are too many open tickets. Try again later");

  // check categories
  let catName = null;
  let catPerms = [];
  const categories = settings.ticket.categories;
  if (categories.length > 0) {
    const options = [];
    settings.ticket.categories.forEach((cat) => options.push({ label: cat.name, value: cat.name }));
    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket-menu")
        .setPlaceholder("Choose the ticket category")
        .addOptions(options)
    );

    await interaction.followUp({ content: "Please choose a ticket category", components: [menuRow] });
    const res = await interaction.channel
      .awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 60 * 1000,
      })
      .catch((err) => {
        if (err.message.includes("time")) return;
      });

    if (!res) return interaction.editReply({ content: "Timed out. Try again", components: [] });
    await interaction.editReply({ content: "Processing", components: [] });
    catName = res.values[0];
    catPerms = categories.find((cat) => cat.name === catName)?.staff_roles || [];
  }
  // Retrieve category channel ID from guild settings
  let catChannel = null;
  if (categoryId) {
    catChannel = guild.channels.cache.get(categoryId);
  }
  try {
    const ticketNumber = (existing + 1).toString();
const permissionOverwrites = [
  {
    id: guild.roles.everyone.id,
    deny: ["ViewChannel"],
  },
  {
    id: user.id,
    allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
  },
];

// Get staff roles from settings
const staffRoles = settings.ticket?.staff_roles || [];


// Loop through each staff role ID
staffRoles.forEach(roleId => {
  const role = guild.roles.cache.get(roleId);
  if (role) {
    permissionOverwrites.push({
      id: role.id,
      allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
    });
  }
});




    if (catPerms?.length > 0) {
      catPerms?.forEach((roleId) => {
        const role = guild.roles.cache.get(roleId);
        if (!role) return;
        permissionOverwrites.push({
          id: role,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        });
      });
    }

    const username = interaction.user.username;

    const tktChannel = await guild.channels.create({
      name: `${username}-${ticketNumber}`,
      type: ChannelType.GuildText,
      topic: `${username}|${user.id}|${catName || "Default"}`,
      permissionOverwrites,
      parent: categoryId,
    });

const staffRolesPing = staffRoles.map(roleId => `<@&${roleId}>`).join(' ');
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Ticket #${ticketNumber}` })
      .setDescription(
        `Hello ${user.toString()}
        ${staffRolesPing} will be with you shortly 
        ${catName ? `\n**Category:** ${catName}` : ""}
        `
      )
      .setFooter({ text: "You may close your ticket anytime by clicking the button below" });

    let buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Close & delete Ticket")
        .setCustomId("TICKET_CLOSE")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Primary)
    );
     // Ping staff roles if present
     if (staffRoles.length > 0) {
       const staffRolesPing = staffRoles.map(roleId => `<@&${roleId}>`).join(' ');
       const messageContent = `**New ticket**\n${staffRolesPing}`;
       await tktChannel.send({ content: messageContent, allowedMentions: { parse: ["everyone", "roles", "users"] } });
     } else {
       await tktChannel.send("**New ticket**");
     }
    const sent = await tktChannel.send({ content: user.toString(), embeds: [embed], components: [buttonsRow],   allowedMentions: { parse: ["users"] } });

    const dmEmbed = new EmbedBuilder()
      .setColor(TICKET.CREATE_EMBED)
      .setAuthor({ name: "Ticket Created" })
      .setThumbnail(guild.iconURL())
      .setDescription(
        `**Server:** ${guild.name}
        ${catName ? `**Category:** ${catName}` : ""}
        `
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("View Channel").setURL(sent.url).setStyle(ButtonStyle.Link)
    );

    user.send({ embeds: [dmEmbed], components: [row] }).catch((ex) => {});

    await interaction.editReply(`💯 Ticket created! in\n${tktChannel}`);
  } catch (ex) {
    error("handleTicketOpen", ex);
    return interaction.editReply("Failed to create ticket channel, an error occurred!");
  }
}

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTicketClose(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const status = await closeTicket(interaction.channel, interaction.user);
  if (status === "MISSING_PERMISSIONS") {
    return interaction.followUp("Cannot close the ticket, missing permissions. Contact server manager for help!");
  } else if (status == "ERROR") {
    return interaction.followUp("Failed to close the ticket, an error occurred!");
  }
}

module.exports = {
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  closeAllTickets,
  handleTicketOpen,
  handleTicketClose,
};
