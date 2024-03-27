const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { getRandomInt } = require("@helpers/Utils");

const BASE_URL = "https://api.truthordarebot.xyz/v1/";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "tod",
  description: "Get a random truth or dare question",
  category: "FUN",
  botPermissions: ["SendMessages"],
//  cooldown: 10,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    options: []
  },

  async messageRun(message) {
    const response = await getTod(message.author);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await getTod(interaction.user);
    await interaction.followUp(response);
  },
};

async function getTod(author) {
  const choice = ["truth", "dare"];
  const tod = getRandomInt(choice.length);
  const uwu = choice[tod];

  const response = await fetch(`${BASE_URL}${uwu}`);
  const data = await response.json();

  if (!data || !data.question) {
    return "Failed to fetch truth or dare question. Please try again later.";
  }

  const embed = new EmbedBuilder()
    .setColor("Random")
    .setTitle(data.question)
    .setFooter({ text: rand === 'truth' ? 'Type: Truth' : 'Type: Dare' })
    .setAuthor({
      name: `Requested by ${author.displayName}`,
      iconURL: author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }),
    });

  return { embeds: [embed] };
}
