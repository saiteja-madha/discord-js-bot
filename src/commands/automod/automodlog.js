const { Command } = require("@src/structures");
const { automodLogChannel } = require("@schemas/guild-schema");
const { canSendEmbeds } = require("@utils/guildUtils");
const { Message } = require("discord.js");

module.exports = class AutoModLog extends Command {
  constructor(client) {
    super(client, {
      name: "automodlog",
      description: "enable/disable logging of automod events",
      command: {
        enabled: true,
        usage: "<#channel|OFF>",
        minArgsCount: 1,
        category: "AUTOMOD",
        userPermissions: ["ADMINISTRATOR"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.reply("Incorrect command usage");
      targetChannel = message.mentions.channels.first();

      if (!canSendEmbeds(targetChannel))
        return message.reply(
          "Ugh! I cannot send logs to that channel? I need the `Write Messages` and `Embed Links` permissions in that channel"
        );
    }

    await automodLogChannel(message.guildId, targetChannel?.id);
    message.channel.sendy(`Configuration saved! AutomodLog channel ${targetChannel ? "updated" : "removed"}`);
  }
};
