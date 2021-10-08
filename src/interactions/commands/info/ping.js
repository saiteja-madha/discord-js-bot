const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

module.exports = class Ping extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "shows the current ping from the bot to the discord servers",
      enabled: true,
      ephemeral: true,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    interaction.followUp(`🏓 Pong : \`${Math.floor(interaction.client.ws.ping)}ms\``);
  }
};
