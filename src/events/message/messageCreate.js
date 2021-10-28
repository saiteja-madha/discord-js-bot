const { Message } = require("discord.js");
const { BotClient } = require("@src/structures");
const { automodHandler, xpHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/guild-schema");
const { safeReply } = require("@utils/botUtils");

/**
 * Emitted whenever a message is created.
 * @param {BotClient} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  // return if no settings
  if (!settings) return;

  // check for bot mentions
  if (message.content.includes(`${client.user.id}`)) safeReply(message, "Access my commands using `/`", 5);

  await automodHandler.performAutomod(message, settings);
  if (settings.ranking.enabled) xpHandler.handleXp(message);
};
