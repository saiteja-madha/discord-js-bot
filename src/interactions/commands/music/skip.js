const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

module.exports = class Skip extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skip the current song",
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

    if (!player.queue.current) return interaction.followUp("There is no music playing.");

    const { title } = player.queue.current;

    player.stop();
    return interaction.followUp(`${title} was skipped.`);
  }
};
