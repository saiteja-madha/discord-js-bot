const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");
const prettyMs = require("pretty-ms");
const { splitBar } = require("string-progressbar");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "np",
  description: "show's what track is currently being played",
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
function nowPlaying({ client, guildId, member }) {
  const player = client.musicManager.players.resolve(guildId);
  if (!player || !player.queue.current) return "🚫 No music is being played!";

  const track = player.queue.current;
  const trackLength = track.info.isStream ? "🔴 LIVE" : prettyMs(track.info.length, { colonNotation: true });
  const trackPosition = track.info.isStream ? "🔴 LIVE" : prettyMs(player.position, { colonNotation: true });

  let progressBar = "";
  if (!track.info.isStream) {
    const totalLength = track.info.length > 6.048e8 ? player.position : track.info.length;
    progressBar =
      new Date(player.position).toISOString().slice(11, 19) +
      " [" +
      splitBar(totalLength, player.position, 15)[0] +
      "] " +
      new Date(track.info.length).toISOString().slice(11, 19);
  } else {
    progressBar = "🔴 LIVE";
  }

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Now playing" })
    .setDescription(`[${track.info.title}](${track.info.uri})`)
    .addFields(
      {
        name: "Song Duration",
        value: "`" + trackLength + "`",
        inline: true,
      },
      {
        name: "Requested By",
        value: track.requesterId || member.user.displayName,
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
