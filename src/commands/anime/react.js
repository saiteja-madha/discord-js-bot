const { Command } = require("@src/structures");
const { CommandInteraction, MessageEmbed, Message } = require("discord.js");
const { getJson } = require("@utils/httpUtils");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

const choices = ["hug", "kiss", "cuddle", "pat", "poke", "slap", "smug", "tickle", "wink"];

module.exports = class Reaction extends Command {
  constructor(client) {
    super(client, {
      name: "react",
      description: "anime reactions",
      enabled: true,
      category: "ANIME",
      cooldown: 5,
      command: {
        enabled: true,
        minArgsCount: 1,
        usage: "[reaction]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "category",
            description: "reaction type",
            type: "STRING",
            required: true,
            choices: choices.map((ch) => ({ name: ch, value: ch })),
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const category = args[0].toLowerCase();
    if (!choices.includes(category)) {
      return message.safeReply(`Invalid choice: \`${category}\`.\nAvailable reactions: ${choices.join(", ")}`);
    }

    const embed = await genReaction(category, message.author);
    await message.safeReply({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");
    const embed = await genReaction(choice, interaction.user);
    await interaction.followUp({ embeds: [embed] });
  }
};

const genReaction = async (category, user) => {
  try {
    let imageUrl;

    // some-random api
    if (category === "wink") {
      const response = await getJson("https://some-random-api.ml/animu/wink");
      if (!response.success) throw new Error("API error");
      imageUrl = response.data.link;
    }

    // neko api
    else {
      imageUrl = (await neko.sfw[category]()).url;
    }

    return new MessageEmbed()
      .setImage(imageUrl)
      .setColor("RANDOM")
      .setFooter({ text: `Requested By ${user.tag}` });
  } catch (ex) {
    return new MessageEmbed()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch meme. Try again!")
      .setFooter({ text: `Requested By ${user.tag}` });
  }
};
