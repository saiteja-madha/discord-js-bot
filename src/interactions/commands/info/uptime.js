const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { timeformat } = require("@utils/miscUtils");

module.exports = class Uptime extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "shows bot's uptime",
      enabled: true,
      ephemeral: true,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    interaction.followUp(`My Uptime: \`${timeformat(process.uptime())}\``);
  }
};
