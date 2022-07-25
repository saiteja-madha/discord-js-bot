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
  category: "ERELA_JS",
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

function nowPlaying({ client, guildId }) {
  const player = client.erelaManager.get(guildId);
  if (!player || !player.queue.current) return "🚫 No music is being played!";

  const track = player.queue.current;
  const end = track.duration > 6.048e8 ? "🔴 LIVE" : new Date(track.duration).toISOString().slice(11, 19);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Now playing" })
    .setDescription(`[${track.title}](${track.uri})`)
    .addFields(
      {
        name: "Song Duration",
        value: "`" + prettyMs(track.duration, { colonNotation: true }) + "`",
        inline: true,
      },
      {
        name: "Requested By",
        value: track.requester.tag || "Unknown",
        inline: true,
      },
      {
        name: "\u200b",
        value:
          new Date(player.position).toISOString().slice(11, 19) +
          " [" +
          splitBar(track.duration > 6.048e8 ? player.position : track.duration, player.position, 15)[0] +
          "] " +
          end,
        inline: false,
      }
    );

  if (typeof track.displayThumbnail === "function") embed.setThumbnail(track.displayThumbnail("hqdefault"));

  return { embeds: [embed] };
}
