const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

module.exports = class Volume extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "set the music player volume",
      enabled: true,
      category: "MUSIC",
      options: [
        {
          name: "volume",
          description: "amount of volume to set",
          type: "INTEGER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const volume = interaction.options.getInteger("volume");

    const player = interaction.client.musicManager.get(interaction.guildId);
    if (!player) return interaction.followUp("No music is being played!");

    if (!volume) return interaction.followUp(`> The player volume is \`${player.volume}\`.`);

    const { channel } = member.voice;

    if (!channel) return interaction.followUp("You need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return interaction.followUp("You're not in the same voice channel.");

    if (volume < 1 || volume > 100) return interaction.followUp("you need to give me a volume between 1 and 100.");

    player.setVolume(volume);
    await interaction.followUp(`> Music player volume to \`${volume}\`.`);
  }
};
