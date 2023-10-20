const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const Client = require("waifu.it");
const api = new Client(process.env.WAIFU_IT_KEY);

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "animequote",
  description: "Get a random anime quote.",
  enabled: true,
  category: "ANIME",
  cooldown: 5,
  slashCommand: {
    enabled: true,
    description: "Get a random anime quote.",
    options: [],
  },

  async interactionRun(interaction) {
    const embed = await genQuote(interaction.user);
    await interaction.followUp({ embeds: [embed] });
  },
};

const genQuote = async (user) => {
  try {
    const data = await api.getQuote();
    return new EmbedBuilder()
      .setTitle(`${data.author} said:`)
      .setDescription(`${data.quote}`)
      .setColor("Random")
      .setFooter({ text: `Anime: ${data.anime}` });
  } catch (ex) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch. Try again!")
      .setFooter({ text: `Requested by ${user.username}` });
  }
};
