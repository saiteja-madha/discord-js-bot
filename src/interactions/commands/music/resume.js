const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { checkMusic } = require("@utils/botUtils");

module.exports = class Resume extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "Resumes the paused song",
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

    if (!player.paused) return interaction.followUp("The player is already resumed");

    player.pause(false);
    await interaction.followUp("▶️ Resumed the music player");
  }
};
