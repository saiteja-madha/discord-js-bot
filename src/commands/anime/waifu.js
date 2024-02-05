const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const Client = require("waifu.it");
const api = new Client(process.env.WAIFU_IT_KEY);

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "waifu",
  description: "get a anime waifu",
  enabled: true,
  category: "ANIME",
  cooldown: 5,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message) {
    const embed = await genWaifu(message.author);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const embed = await genWaifu(interaction);
    await interaction.followUp({ embeds: [embed] });
  },
};

const genWaifu = async (user) => {
  try {
    const waifu = await api.getWaifu();
    return new EmbedBuilder()
      .setTitle(waifu.name.full)
      .setDescription(`Anime: ${waifu.media.nodes[0].title.romaji}`)
      .setImage(waifu.image.large)
      .setColor("Random")
      .setFooter({ text: `❤️ ${waifu.favourites}` });
  } catch (ex) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch. Try again!")
      .setFooter({ text: `Requested by ${user.user.username}` });
  }
};

