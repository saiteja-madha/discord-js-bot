const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { EMBED_COLORS } = require("@root/config");

const BASE_URL = "https://lrclib.net/api";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "lyric",
  description: "find lyric of the song",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<Song Title - singer>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "find lyric of the song",
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args.join(" ");
    if (!choice) {
      return message.safeReply("Invalid Lyric selected.");
    }
    const response = await getLyric(message.author, choice);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("query");
    const response = await getLyric(interaction.user, choice);
    await interaction.followUp(response);
  },
};

async function getLyric(user, choice) {
  try {
    const response = await getJson(`${BASE_URL}/search?q=${encodeURIComponent(choice)}`);

    if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
      return { content: `❌ No lyrics found for "${choice}".` };
    }

    const lyricData = response.data[0];
    let lyrics = lyricData.plainLyrics;

    if (!lyrics && lyricData.syncedLyrics) {
      lyrics = lyricData.syncedLyrics
        .split("\n")
        .map((line) => line.replace(/^\[\d{2}:\d{2}\.\d{2}\]\s?/g, ""))
        .filter((line) => line.trim())
        .join("\n");
    }

    if (!lyrics) lyrics = "No lyrics available";

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(`${lyricData.artistName} - ${lyricData.trackName}`)
      .setDescription(lyrics.length > 4090 ? lyrics.substring(0, 4090) + "..." : lyrics)
      .setFooter({ text: `Requested by: ${user.username}` });

    return { embeds: [embed] };
  } catch (error) {
    console.error("Lrclib Api Error:", error);
    return "An error occurred while fetching lyrics.";
  }
}
