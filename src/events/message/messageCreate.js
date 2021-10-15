const { Message } = require("discord.js");
const { BotClient } = require("@src/structures");
const { automodHandler, xpHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/guild-schema");

/**
 * @param {BotClient} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  // check for bot mentions
  if (message.content.includes(`${client.user.id}`)) message.reply(`My prefix is \`${settings.prefix}\``);

  await automodHandler.performAutomod(message, settings);
  if (settings.ranking.enabled) xpHandler.handleXp(message);
};
