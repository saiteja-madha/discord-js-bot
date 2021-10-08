const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

module.exports = class Pause extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "Pause the current song",
      enabled: true,
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

    if (player.paused) return interaction.followUp("The player is already paused.");

    player.pause(true);
    return interaction.followUp("Paused the player.");
  }
};
