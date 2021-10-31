const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Stop extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "stop",
      description: "🎵 stop the music player and clear the entire music queue",
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

    player.destroy();
    await interaction.followUp("🎶 The music player is stopped and queue has been cleared");
  }
};
