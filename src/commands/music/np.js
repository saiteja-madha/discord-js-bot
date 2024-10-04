const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");
const { formatTime } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "np",
  description: "Shows what track is currently being played",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["nowplaying"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const response = nowPlaying(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = nowPlaying(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function nowPlaying({ client, guildId, member }) {
  const player = client.musicManager.players.resolve(guildId);
  if (!player || !player.queue.current) return "🚫 No music is being played!";

  const track = player.queue.current;
  const totalLength = track.info.length;
  const position = player.position;
  const progress = Math.round((position / totalLength) * 15);
  const progressBar = `${formatTime(position)} [${"▬".repeat(
      progress)}🔘${"▬".repeat(15 - progress)}] ${formatTime(totalLength)}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Now playing" })
    .setDescription(`[${track.info.title}](${track.info.uri})`)
    .addFields(
      {
        name: "Song Duration",
        value: `\`${formatTime(track.info.length)}\``,
        inline: true,
      },
      {
        name: "Requested By",
        value: track.requesterId ? track.requesterId : member.user.displayName,
        inline: true,
      },
      {
        name: "\u200b",
        value: progressBar,
        inline: false,
      }
    );

  return { embeds: [embed] };
}