const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

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
    if (!player) return interaction.followUp("No music is being played!");

    const { channel } = member.voice;

    if (!channel) return interaction.followUp("You need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return interaction.followUp("You're not in the same voice channel.");

    if (!player.paused) return interaction.followUp("The player is already resumed");

    player.pause(false);
    await interaction.followUp("Resumed the player");
  }
};
