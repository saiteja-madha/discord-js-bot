const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Skip extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skip the current song",
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
    const { title } = player.queue.current;

    player.stop();
    await interaction.followUp(`⏯️ ${title} was skipped.`);
  }
};
