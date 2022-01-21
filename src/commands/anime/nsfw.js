const { Command } = require("@src/structures");
const { CommandInteraction, MessageEmbed, Message } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

// Add any 25 choices from here https://github.com/Nekos-life/nekos-dot-life/blob/master/endpoints.json

const choices = [
  "anal",
  "boobs",
  "bJ",
  "blowjob",
  "classic",
  "cumsluts",
  "cumArts",
  "ero",
  "feet",
  "femdom",
  "futanari",
  "girlSolo",
  "gasm",
  "hentai",
  "lesbian",
  "trap",
  "neko",
  "pussy",
  "pussyWankGif",
  "pussyArt",
  "spank",
  "yuri",
];

module.exports = class NSFW extends Command {
  constructor(client) {
    super(client, {
      name: "nsfw",
      description: "show some random nsfw",
      enabled: true,
      category: "ANIME",
      cooldown: 10,
      validations: [
        {
          callback: ({ channel }) => channel?.nsfw,
          message: "This command can only be used in nsfw channel",
        },
      ],
      command: {
        enabled: true,
        usage: "nsfw [category]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "category",
            description: "nsfw category",
            type: "STRING",
            required: false,
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
    const choice = args.join(" ");
    const embed = await genNSFW(choice, message.author);
    await message.reply({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");
    const embed = await genNSFW(choice, interaction.user);
    await interaction.followUp({ embeds: [embed] });
  }
};

const genNSFW = async (category, user) => {
  if (!category) category = "randomHentaiGif";
  try {
    const response = await neko.nsfw[category]();
    return new MessageEmbed()
      .setImage(response.url)
      .setColor("RANDOM")
      .setFooter({ text: `Requested by ${user.tag}` });
  } catch (ex) {
    return new MessageEmbed()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Failed to fetch meme. Try again!")
      .setFooter({ text: `Requested by ${user.tag}` });
  }
};
