const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

module.exports = class Stop extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "stop",
      description: "stop the music player",
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

    player.destroy();
    await interaction.followUp("The music player is stopped");
  }
};
