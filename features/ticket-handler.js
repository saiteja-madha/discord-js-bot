const { getSettings } = require("@schemas/settings-schema");
const { getConfig } = require("@schemas/ticket-schema");
const { sendMessage } = require("@utils/botUtils");
const { getTicketChannels, getExistingTicketChannel, isTicketChannel, closeTicket } = require("@utils/ticketUtils");
const { Client, MessageEmbed, MessageReaction, User } = require("discord.js");
const outdent = require("outdent");
const { EMOJIS, EMBED_COLORS } = require("@root/config.json");

/**
 * @param {Client} client
 */
async function run(client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) reaction = await reaction.fetch();
    if (user.partial) user = await user.fetch();
    if (user.bot) return;

    if (reaction.emoji.name === EMOJIS.TICKET_OPEN) return await handleNewTicket(reaction, user);
    if (reaction.emoji.name === EMOJIS.TICKET_CLOSE) return await handleCloseTicket(reaction, user);
  });
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleNewTicket(reaction, user) {
  const { message } = reaction;
  const { guild, channel } = message;

  try {
    const settings = await getSettings(guild.id);
    const config = await getConfig(guild.id, channel.id, message.id);
    if (!config) return;
    const existing = getTicketChannels(guild).size;

    // check if ticket limit is reached
    if (existing > settings.ticket.limit) {
      let sent = await sendMessage(channel, "Ticket limit reached! Try again later");
      setTimeout(() => {
        if (sent.deletable) sent.delete().catch((err) => {});
      }, 3000);
      return;
    }

    // check if user already has an open ticket
    const alreadyExists = getExistingTicketChannel(guild, user.id);
    if (alreadyExists) return await reaction.users.remove(user.id);

    // create a channel
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

    if (config.support_role)
      permissionOverwrites.push({
        id: config.support_role,
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
      });

    const tktChannel = await guild.channels.create(`tіcket-${ticketNumber}`, {
      type: "GUILD_TEXT",
      topic: `tіcket|${user.id}|${config.title}`,
      permissionOverwrites,
    });

    let embed = new MessageEmbed()
      .setAuthor("Ticket #" + ticketNumber)
      .setDescription(
        `Hello ${user.toString()}\nSupport will be with you shortly\n\n**Ticket Reason:**\n${config.title}`
      )
      .setFooter("To close your ticket react to the lock below");

    const sent = await sendMessage(tktChannel, { content: user.toString(), embeds: [embed] });
    await sent.react(EMOJIS.TICKET_CLOSE);

    const desc = outdent`
    ${EMOJIS.ARROW} **Server Name:** ${channel.guild.name}
    ${EMOJIS.ARROW} **Title:** ${config.title}
    ${EMOJIS.ARROW} **Reason:** ${config.reason ? config.reason : "No reason provided"}
    
    [View Channel](${sent.url})
  `;
    const dmEmbed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("Ticket Created")
      .setDescription(desc);

    user.send({ embeds: [dmEmbed] }).catch((err) => {});
  } catch (ex) {
    console.log(ex);
  } finally {
    await reaction.users.remove(user.id);
  }
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleCloseTicket(reaction, user) {
  const { message } = reaction;
  if (isTicketChannel(message.channel)) {
    await closeTicket(message.channel, user, "Reacted with emoji");
  }
}

module.exports = {
  run,
};
