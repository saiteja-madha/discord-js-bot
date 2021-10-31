const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Resume extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "🎵 resumes the paused song",
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
    if (!player.paused) return interaction.followUp("The player is already resumed");

    player.pause(false);
    await interaction.followUp("▶️ Resumed the music player");
  }
};
