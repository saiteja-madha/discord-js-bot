const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { checkMusic } = require("@utils/botUtils");

module.exports = class Stop extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "stop",
      description: "stop the music player and clear the entire music queue",
      enabled: true,
      category: "MUSIC",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const player = interaction.client.musicManager.get(interaction.guildId);

    const playable = checkMusic(member, player);
    if (typeof playable !== "boolean") return interaction.followUp(playable);

    player.destroy();
    await interaction.followUp("🎶 The music player is stopped and queue has been cleared");
  }
};
