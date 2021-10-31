const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Pause extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "🎵 pause the current song",
      enabled: true,
      category: "MUSIC",
      validations: musicValidations,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const player = interaction.client.musicManager.get(interaction.guildId);
    if (player.paused) return interaction.followUp("The player is already paused.");

    player.pause(true);
    await interaction.followUp("⏸️ Paused the music player.");
  }
};
