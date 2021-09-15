const {
  MessageEmbed,
  MessageAttachment,
  Message,
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");
const { Command } = require("@src/structures");
const { downloadImage } = require("@utils/httpUtils");
const { getImageFromCommand, getGenerator } = require("@utils/imageUtils");
const { EMBED_COLORS } = require("@root/config.js");

const availableGenerators = [
  "ad",
  "affect",
  "beautiful",
  "bobross",
  "color",
  "confusedstonk",
  "delete",
  "facepalm",
  "hitler",
  "jail",
  "jokeoverhead",
  "karaba",
  "mms",
  "notstonk",
  "poutine",
  "rainbow",
  "rip",
  "shit",
  "stonk",
  "tatoo",
  "thomas",
  "trash",
  "wanted",
  "wasted",
];

module.exports = class Generator extends Command {
  constructor(client) {
    super(client, {
      name: "generator",
      description: "generates a meme for the provided image",
      cooldown: 5,
      command: {
        enabled: true,
        aliases: availableGenerators,
        category: "IMAGE",
        botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "name",
            description: "the type of generator",
            type: "STRING",
            required: true,
            choices: availableGenerators.map((gen) => ({ name: gen, value: gen })),
          },
          {
            name: "user",
            description: "the user to whose avatar the generator needs to applied",
            type: "USER",
            required: false,
          },
          {
            name: "link",
            description: "the image link to which the generator needs to applied",
            type: "STRING",
            required: false,
          },
        ],
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args, invoke) {
    const image = await getImageFromCommand(message, args);

    // use invoke as an endpoint
    const url = getGenerator(invoke.toLowerCase(), image);
    const buffer = await downloadImage(url);

    if (!buffer) return message.reply("Failed to generate image");

    const attachment = new MessageAttachment(buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setImage("attachment://attachment.png")
      .setFooter(`Requested by: ${message.author.tag}`);

    message.channel.send({ embeds: [embed], files: [attachment] });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    const author = interaction.user;
    const user = options.getUser("user");
    const imageLink = options.getString("link");
    const generator = options.getString("name");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, format: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, format: "png" });

    const url = getGenerator(generator, image);
    const buffer = await downloadImage(url);

    const attachment = new MessageAttachment(buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setImage("attachment://attachment.png")
      .setFooter(`Requested by: ${author.tag}`);

    interaction.followUp({ embeds: [embed], files: [attachment] });
  }
};
