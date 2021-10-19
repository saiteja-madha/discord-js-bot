const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

const levels = {
  none: 0.0,
  low: 0.1,
  medium: 0.15,
  high: 0.25,
};

module.exports = class Bassboost extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bassboost",
      description: "set bassboost level",
      enabled: true,
      category: "MUSIC",
      options: [
        {
          name: "level",
          description: "bassboost level",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "none",
              value: "none",
            },
            {
              name: "low",
              value: "low",
            },
            {
              name: "medium",
              value: "medium",
            },
            {
              name: "high",
              value: "high",
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    const player = interaction.client.musicManager.get(interaction.guildId);
    if (!player) return interaction.followUp("🚫 No music is being played!");

    const { channel } = member.voice;

    if (!channel) return interaction.followUp("🚫 You need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return interaction.followUp("🚫 You're not in the same voice channel.");

    let level = interaction.options.getString("level");

    const bands = new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }));
    player.setEQ(...bands);

    await interaction.followUp(`> Set the bassboost level to ${level}`);
  }
};
