const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");

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
        enabled: true,
        ephemeral: true,
        options: [],
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

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    interaction.followUp(`🏓 Pong : \`${Math.floor(interaction.client.ws.ping)}ms\``);
  }
};
