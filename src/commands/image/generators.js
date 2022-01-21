const { MessageEmbed, MessageAttachment, Message, CommandInteraction } = require("discord.js");
const { Command } = require("@src/structures");
const { getBuffer } = require("@utils/httpUtils");
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
      category: "IMAGE",
      botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
      command: {
        enabled: true,
        aliases: availableGenerators,
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
    const response = await getBuffer(url);

    if (!response.success) return message.reply("Failed to generate image");

    const attachment = new MessageAttachment(response.buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setFooter({ text: `Requested by: ${message.author.tag}` });

    await message.reply({ embeds: [embed], files: [attachment] });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const author = interaction.user;
    const user = interaction.options.getUser("user");
    const imageLink = interaction.options.getString("link");
    const generator = interaction.options.getString("name");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, format: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, format: "png" });

    const url = getGenerator(generator, image);
    const response = await getBuffer(url);

    if (!response.success) return interaction.followUp("Failed to generate image");

    const attachment = new MessageAttachment(response.buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setFooter({ text: `Requested by: ${author.tag}` });

    await interaction.followUp({ embeds: [embed], files: [attachment] });
  }
};
