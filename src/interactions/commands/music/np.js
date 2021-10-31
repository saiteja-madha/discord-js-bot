const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const prettyMs = require("pretty-ms");
const { splitBar } = require("string-progressbar");

module.exports = class Skip extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "np",
      description: "🎵 show's what track is currently being played",
      enabled: true,
      category: "MUSIC",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const player = interaction.client.musicManager.get(interaction.guildId);
    if (!player || !player.queue.current) return interaction.followUp("🚫 No music is being played!");

    const track = player.queue.current;
    const end = track.duration > 6.048e8 ? "🔴 LIVE" : new Date(track.duration).toISOString().slice(11, 19);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(track.displayThumbnail("hqdefault"))
      .setAuthor("Now playing")
      .setDescription(`[${track.title}](${track.uri})`)
      .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
      .addField("Added By", track.requester.tag || "NA", true)
      .addField(
        "\u200b",
        new Date(player.position).toISOString().slice(11, 19) +
          " [" +
          splitBar(track.duration > 6.048e8 ? player.position : track.duration, player.position, 15)[0] +
          "] " +
          end,
        false
      );
    await interaction.followUp({ embeds: [embed] });
  }
};
