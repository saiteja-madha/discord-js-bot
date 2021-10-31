const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class ShuffleCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "shuffle",
      description: "🎵 shuffle the queue",
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
    player.queue.shuffle();
    await interaction.followUp("🎶 Queue has been shuffled");
  }
};
