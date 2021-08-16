const { getSettings } = require("@schemas/settings-schema");
const { getConfig } = require("@schemas/ticket-schema");
const { sendMessage } = require("@utils/botUtils");
const {
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  openTicket,
} = require("@utils/ticketUtils");
const { Client, MessageReaction, User } = require("discord.js");
const { EMOJIS } = require("@root/config.json");

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

    // check if user already has an open ticket
    const alreadyExists = getExistingTicketChannel(guild, user.id);
    if (alreadyExists) return await reaction.users.remove(user.id);

    // check if ticket limit is reached
    const existing = getTicketChannels(guild).size;
    if (existing > settings.ticket.limit) {
      let sent = await sendMessage(channel, "Ticket limit reached! Try again later");
      setTimeout(() => {
        if (sent.deletable) sent.delete().catch((err) => {});
      }, 3000);
      return;
    }

    await openTicket(guild, user, config.title, config.support_role);
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
