const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "shows the current ping from the bot to the discord servers",
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
    message.reply(`🏓 Pong : \`${Math.floor(message.client.ws.ping)}ms\``);
  }
};
