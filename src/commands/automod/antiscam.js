const { Command } = require("@src/structures");
const { antiScam } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class AntiLinks extends Command {
  constructor(client) {
    super(client, {
      name: "antiscam",
      description: "Enable or disable antiscam detection",
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

    await antiScam(message.guildId, status);
    message.channel.send(`Antiscam detection is now ${status ? "enabled" : "disabled"}`);
  }
};
