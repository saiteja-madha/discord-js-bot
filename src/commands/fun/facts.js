const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
const BASE_URL = "https://some-random-api.com/animal";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "facts",
  description: "shows a random animal fact",
  cooldown: 5,
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "name",
        description: "animal type",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: animals.map((animal) => ({ name: animal, value: animal })),
      },
    ],
  },

  // This function runs when a user interacts with the slash command
  async interactionRun(interaction) {
    const choice = interaction.options.getString("name");
    const response = await getFact(interaction.user, choice);
    await interaction.followUp(response);
  },
};

async function getFact(user, choice) {
  const response = await getJson(`${BASE_URL}/${choice}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const fact = response.data?.fact;
  const imageUrl = response.data?.image;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setThumbnail(imageUrl)
    .setDescription(fact)
    .setFooter({ text: `Requested by ${user.tag}` });

  return { embeds: [embed] };
}
