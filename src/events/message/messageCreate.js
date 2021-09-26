const { Message } = require("discord.js");
const { BotClient } = require("@src/structures");
const { automodHandler, xpHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/guild-schema");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {BotClient} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);
  const { prefix } = settings;

  // check for bot mentions
  if (message.content.includes(`${client.user.id}`)) message.reply(`My prefix is \`${settings.prefix}\``);

  if (message.content.startsWith(prefix)) {
    const args = message.content.replace(`${prefix}`, "").split(/\s+/);
    const invoke = args.shift().toLowerCase();
    const cmd = client.getCommand(invoke);

    // command is found
    if (cmd) {
      try {
        await cmd.execute(message, args, invoke, prefix);
      } catch (ex) {
        sendMessage(message.channel, "Oops! An error occurred while running the command");
        client.logger.error("messageRun", ex);
      }
    }

    // if not a command
    else {
      await automodHandler.performAutomod(message, settings);
      if (settings.ranking.enabled) xpHandler.handleXp(message);
    }
  }
};
