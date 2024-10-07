const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "queue",
  description: "displays the current music queue",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["q"],
    usage: "[page]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "page",
        description: "page number",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const page = args.length && Number(args[0]) ? Number(args[0]) : 1;
    const response = await getQueue(message, page);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const page = interaction.options.getInteger("page");
    const response = await getQueue(interaction, page);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} pgNo
 */
async function getQueue({ client, guild }, pgNo) {
  const player = client.manager.getPlayer(guild.id);
  if (!player) return "🚫 There is no music playing in this guild.";

  const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setAuthor({ name: `Queue for ${guild.name}` });

  const end = (pgNo || 1) * 10;
  const start = end - 10;

  const tracks = player.queue.tracks.slice(start, end);

  if (player.queue.current) {
    const currentTrack = player.queue.current;
    embed
      .addFields({
        name: "Current",
        value: `[${currentTrack.info.title}](${currentTrack.info.uri}) \`[${client.utils.formatTime(currentTrack.info.duration)}]\``,
      })
      .setThumbnail(currentTrack.info.artworkUrl);
  }

  const queueList = tracks.map(
    (track, index) =>
      `${start + index + 1}. [${track.info.title}](${track.info.uri}) \`[${client.utils.formatTime(track.info.duration)}]\``
  );

  embed.setDescription(
    queueList.length ? queueList.join("\n") : `No tracks in ${pgNo > 1 ? `page ${pgNo}` : "the queue"}.`
  );

  const maxPages = Math.ceil(player.queue.tracks.length / 10);
  embed.setFooter({ text: `Page ${pgNo > maxPages ? maxPages : pgNo} of ${maxPages}` });

  return { embeds: [embed] };
}