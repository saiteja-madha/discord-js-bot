const { getSettings } = require("@schemas/settings-schema");
const { getConfig } = require("@schemas/ticket-schema");
const { sendMessage } = require("@utils/botUtils");
const { getTicketChannels, getExistingTicketChannel, isTicketChannel, closeTicket } = require("@utils/ticketUtils");
const { Client, MessageEmbed, MessageReaction, User } = require("discord.js");
const outdent = require("outdent");

/**
 * @param {Client} client
 */
async function run(client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) reaction = reaction.fetch();
    if (user.partial) user = user.fetch();
    if (user.bot) return;

    if (reaction.emoji.toString() === "🎫") return await handleNewTicket(reaction, user);
    if (reaction.emoji.toString() === "🔒") return await handleCloseTicket(reaction, user);
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
    const tktChannel = await guild.channels.create(`tіcket-${ticketNumber}`, {
      type: "GUILD_TEXT",
      permissionOverwrites: [
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
        config.support_role && {
          id: config.support_role,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
        },
      ],
    });

    let embed = new MessageEmbed()
      .setAuthor("Ticket #" + ticketNumber)
      .setDescription(`Hello ${user.toString()}\nSupport will be with you shortly\n\n**Ticket Reason:**${config.title}`)
      .setFooter("To close your ticket react to the lock below");

    const sent = await sendMessage(tktChannel, { content: user.toString(), embeds: [embed] });
    await sent.react("🔒");

    const desc = outdent`
    ${EMOJIS.WHITE_SMALL_SQUARE} **Server Name:** ${channel.guild.name}
    ${EMOJIS.WHITE_SMALL_SQUARE} **Title:** ${config.title}
    ${EMOJIS.WHITE_SMALL_SQUARE} **Reason:** ${config.reason ? config.reason : "No reason provided"}
    
    [View Channel](${sent.url})
  `;
    const embed = new MessageEmbed().setAuthor("Ticket Created").setDescription(desc);
    user.send(embed).catch((err) => {});
  } catch (ex) {
    console.log(ex);
  }
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleCloseTicket(reaction, user) {
  const { message } = reaction;
  if (isTicketChannel(channel)) await closeTicket(message.channel, user, "Reacted with emoji");
}

module.exports = {
  run,
};
