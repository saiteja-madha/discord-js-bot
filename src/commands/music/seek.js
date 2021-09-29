const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Seek extends Command {
  constructor(client) {
    super(client, {
      name: "seek",
      description: "Seeks to the given time in seconds",
      command: {
        enabled: true,
        usage: "<seconds>",
        minArgsCount: 1,
        category: "MUSIC",
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
  async messageRun(message, args) {}
};
