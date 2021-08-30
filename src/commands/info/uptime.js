const { Command } = require("@src/structures");
const { timeformat } = require("@utils/miscUtils");
const { Message } = require("discord.js");

module.exports = class UptimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "shows bot's uptime",
      command: {
        enabled: true,
        category: "INFORMATION",
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
    message.reply(`My Uptime: \`${timeformat(process.uptime())}\``);
  }
};
