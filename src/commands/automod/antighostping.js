const { Command } = require("@src/structures");
const { antiGhostPing } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class AntiGhostPing extends Command {
  constructor(client) {
    super(client, {
      name: "antighostping",
      description: "Log deleted messages with mentions (Requires `!automodlog` setup)",
      command: {
        enabled: true,
        usage: "<ON|OFF>",
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
    let status;

    if (input === "none" || input === "off" || input === "disable") status = false;
    else if (input === "on" || input === "enable") status = true;
    else return message.reply("Incorrect Command Usage");

    await antiGhostPing(message.guildId, status);
    message.channel.send(`Anti-ghostping logging is now ${status ? "enabled" : "disabled"}`);
  }
};
