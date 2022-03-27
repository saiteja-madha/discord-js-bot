const { commandHandler, automodHandler, xpHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  // check for bot mentions
  if (message.content.includes(`${client.user.id}`)) {
    sendMessage(message.channel, `My prefix is \`${settings.prefix}\``);
  }

  // command handler
  let isCommand = false;
  if (message.content && message.content.startsWith(settings.prefix)) {
    const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
    const cmd = client.getCommand(invoke);
    if (cmd) {
      isCommand = true;
      commandHandler.handlePrefixCommand(message, cmd, settings);
    }
  }

  // if not a command
  if (!isCommand) await automodHandler.performAutomod(message, settings);
  if (settings.ranking.enabled) xpHandler.handleXp(message);
};
