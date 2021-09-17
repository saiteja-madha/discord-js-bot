const { Command } = require("@src/structures");
const { modLogChannel } = require("@schemas/guild-schema");
const { Message } = require("discord.js");
const { canSendEmbeds } = require("@root/src/utils/guildUtils");

module.exports = class SetPrefix extends Command {
  constructor(client) {
    super(client, {
      name: "modlog",
      description: "enable or disable moderation logs",
      command: {
        enabled: true,
        usage: "<#channel|OFF>",
        minArgsCount: 1,
        category: "ADMIN",
        userPermissions: ["ADMINISTRATOR"],
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

    await modLogChannel(message.guildId, targetChannel?.id);
    message.channel.send(`Configuration saved! Modlog channel ${targetChannel ? "updated" : "removed"}`);
  }
};
