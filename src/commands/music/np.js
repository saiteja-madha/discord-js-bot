const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "np",
      description: "SHow what is playing currently",
      command: {
        enabled: true,
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
