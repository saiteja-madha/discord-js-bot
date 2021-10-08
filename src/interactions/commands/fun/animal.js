const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");

const animals = ["cat", "dog"];

module.exports = class CatCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "animal",
      description: "shows a random animal image",
      enabled: true,
      options: [
        {
          name: "name",
          description: "animal type",
          type: "STRING",
          required: true,
          choices: animals.map((animal) => ({ name: animal, value: animal })),
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const choice = interaction.options.getString("name");

    let response;
    switch (choice) {
      case "cat":
        response = await cat(interaction.user);
        break;

      case "dog":
        response = await dog(interaction.user);
        break;
    }

    return interaction.followUp(response);
  }
};

const cat = async (user) => {
  const response = await getJson("https://api.thecatapi.com/v1/images/search");
  if (!response.success) return MESSAGES.API_ERROR;

  const image = response.data[0]?.url;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(image)
    .setFooter(`Requested by ${user.tag}`);

  return { embeds: [embed] };
};

const dog = async (user) => {
  const response = await getJson("https://dog.ceo/api/breeds/image/random");
  if (!response.success) return MESSAGES.API_ERROR;

  const image = response.data?.message;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(image)
    .setFooter(`Requested by ${user.tag}`);

  return { embeds: [embed] };
};
