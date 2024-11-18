const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");
const { splitBar } = require("string-progressbar");

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

  async messageRun(message, args) {
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
function nowPlaying({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  if (!player || !player.queue.current) {
    return "🚫 No music is being played!";
  }

  const track = player.queue.current;
  const end = track.info.duration > 6.048e8 ? "🔴 LIVE" : client.utils.formatTime(track.info.duration);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Now Playing" })
    .setDescription(`[${track.info.title}](${track.info.uri})`)
    .addFields(
      {
        name: "Song Duration",
        value: client.utils.formatTime(track.info.duration),
        inline: true,
      },
      {
        name: "Requested By",
        value: track.requester.username || "Unknown",
        inline: true,
      },
      {
        name: "\u200b",
        value:
          client.utils.formatTime(player.position) +
          " [" +
          splitBar(track.info.duration > 6.048e8 ? player.position : track.info.duration, player.position, 15)[0] +
          "] " +
          end,
        inline: false,
      }
    );

  return { embeds: [embed] };
}
