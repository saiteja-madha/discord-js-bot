const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const prettyMs = require("pretty-ms");
const { durationToMillis } = require("@utils/miscUtils");
const { checkMusic } = require("@utils/botUtils");

module.exports = class Volume extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "seek",
      description: "sets the playing track's position to the specified position",
      enabled: true,
      category: "MUSIC",
      options: [
        {
          name: "time",
          description: "The time you want to seek to.",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const player = interaction.client.musicManager?.get(interaction.guildId);

    const playable = checkMusic(member, player);
    if (typeof playable !== "boolean") return interaction.followUp(playable);

    const time = interaction.options.getString("time");
    const seekTo = durationToMillis(time);

    if (seekTo > player.queue.current.duration) {
      return interaction.followUp("The duration you provide exceeds the duration of the current track");
    }

    player.seek(seekTo);
    await interaction.followUp(`Seeked to ${prettyMs(seekTo, { colonNotation: true, secondsDecimalDigits: 0 })}`);
  }
};
