const { Channel, Guild, GuildMember, TextBasedChannels, MessageEmbed, User } = require("discord.js");
const { postToBin } = require("@utils/httpUtils");
const { EMBED_COLORS, EMOJIS } = require("@root/config.json");
const { outdent } = require("outdent");
const { getSettings } = require("@schemas/settings-schema");
const { sendMessage } = require("@utils/botUtils");

const PERMS = [
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "EMBED_LINKS",
  "READ_MESSAGE_HISTORY",
  "ADD_REACTIONS",
  "MANAGE_CHANNELS",
  "MANAGE_MESSAGES",
];

/**
 * @param {Channel} channel
 */
function isTicketChannel(channel) {
  return (
    channel.type === "GUILD_TEXT" &&
    channel.name.startsWith("tіcket-") &&
    channel.topic &&
    channel.topic.startsWith("tіcket|")
  );
}

/**
 * @param {Guild} guild
 */
function getTicketChannels(guild) {
  return guild.channels.cache.filter((ch) => isTicketChannel(ch));
}

/**
 * @param {GuildMember} member
 */
function getExistingTicketChannel(guild, userId) {
  const tktChannels = getTicketChannels(guild);
  return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
}

/**
 * @param {TextBasedChannels} channel
 */
async function parseTicketDetails(channel) {
  if (!channel.topic) return;
  const split = channel.topic?.split("|");
  const userId = split[1];
  const title = split[2];
  const user = await channel.client.users.fetch(userId, { cache: false }).catch((err) => {});
  return {
    title,
    user,
  };
}

/**
 * @param {TextBasedChannels} channel
 * @param {User} closedBy
 * @param {String} reason
 */
async function closeTicket(channel, closedBy, reason) {
  if (
    !channel.deletable ||
    !channel.permissionsFor(channel.guild.me).has(["MANAGE_CHANNELS", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"])
  ) {
    return {
      success: false,
      message: "Missing permissions",
    };
  }

  try {
    const config = await getSettings(channel.guild.id);
    const messages = await channel.messages.fetch();
    let reversed = Array.from(messages.values()).reverse();

    let content = "";
    reversed.forEach((m) => {
      content += "[" + new Date(m.createdAt).toLocaleString("en-US") + "] - " + m.author.tag + "\n";
      if (m.cleanContent !== "") content += m.cleanContent + "\n";
      if (m.attachments.size > 0) content += m.attachments.map((att) => att.proxyURL).join(", ") + "\n";
      content += "\n";
    });

    const logsUrl = await postToBin(content, "Ticket Logs for " + channel.name);
    const ticketDetails = await parseTicketDetails(channel);

    const desc = outdent`
    ${EMOJIS.ARROW} **Title:** ${ticketDetails.title}
    ${EMOJIS.ARROW} **Opened By:** ${ticketDetails.user ? ticketDetails.user.tag : "User left"}
    ${EMOJIS.ARROW} **Closed By:** ${closedBy ? closedBy.tag : "User left"}
    ${EMOJIS.ARROW} **Reason:** ${reason != null ? reason : "No reason provided"}
    ${logsUrl == null ? "" : "\n[View Logs](" + logsUrl + ")"}
    `;

    await channel.delete();
    const embed = new MessageEmbed().setAuthor("Ticket Closed").setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);

    // send embed to user
    if (ticketDetails.user) ticketDetails.user.send({ embeds: [embed] }).catch((ex) => {});

    // send embed to log channel
    if (config.ticket.log_channel) {
      let logChannel = channel.guild.channels.cache.find((ch) => ch.id === config.ticket.log_channel);
      if (logChannel) sendMessage(logChannel, { embeds: [embed] });
    }

    return {
      success: true,
      message: "success",
    };
  } catch (ex) {
    console.log(ex);
    return {
      success: false,
      message: "Unexpected error occurred",
    };
  }
}

/**
 * @param {Guild} guild
 */
async function closeAllTickets(guild) {
  const channels = getTicketChannels(guild);
  let success = 0;
  let failed = 0;

  for (const [id, ch] of channels) {
    const status = await closeTicket(ch, guild.me.user, "Force close all open tickets");
    if (status.success) success++;
    else failed++;
  }
  return [success, failed];
}

/**
 * @param {Guild} guild
 * @param {User} user
 */
async function openTicket(guild, user, title, supportRole) {
  try {
    const existing = getTicketChannels(guild).size;
    const ticketNumber = (existing + 1).toString();
    const permissionOverwrites = [
      {
        id: guild.roles.everyone,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: user.id,
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
      },
      {
        id: guild.me.roles.highest.id,
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
      },
    ];

    if (supportRole)
      permissionOverwrites.push({
        id: supportRole,
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
      });

    const tktChannel = await guild.channels.create(`tіcket-${ticketNumber}`, {
      type: "GUILD_TEXT",
      topic: `tіcket|${user.id}|${title}`,
      permissionOverwrites,
    });

    let embed = new MessageEmbed()
      .setAuthor("Ticket #" + ticketNumber)
      .setDescription(
        outdent`
      Hello ${user.toString()}
      Support will be with you shortly
        
      **Ticket Reason:**
      ${title}`
      )
      .setFooter("To close your ticket react to the lock below");

    const sent = await sendMessage(tktChannel, { content: user.toString(), embeds: [embed] });
    await sent.react(EMOJIS.TICKET_CLOSE);

    const desc = outdent`
    ${EMOJIS.ARROW} **Server Name:** ${guild.name}
    ${EMOJIS.ARROW} **Title:** ${title}
    ${EMOJIS.ARROW} **Ticket:** #${ticketNumber}
    
    [View Channel](${sent.url})
  `;
    const dmEmbed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("Ticket Created")
      .setDescription(desc);

    user.send({ embeds: [dmEmbed] }).catch((err) => {});
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

module.exports = {
  PERMS,
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  closeAllTickets,
  openTicket,
};
