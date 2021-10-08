const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const prettyMs = require("pretty-ms");

module.exports = class Skip extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "np",
      description: "Show what is playing currently",
      enabled: true,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const player = interaction.client.musicManager.get(interaction.guildId);
    if (!player || !player.queue.current) return interaction.followUp("No music is being played!");

    let track = player.queue.current;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(track.displayThumbnail("hqdefault"))
      .setAuthor("Now playing")
      .setDescription(`[${track.title}](${track.uri})`)
      .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
      .addField("Added By", track.requester.tag || "NA", true);

    interaction.followUp({ embeds: [embed] });
  }
};
