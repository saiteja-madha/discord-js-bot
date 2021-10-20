const { MessageEmbed, MessageAttachment, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { getBuffer } = require("@utils/httpUtils");
const { EMBED_COLORS } = require("@root/config.js");

const IMAGE_API_BASE = "https://discord-js-image-manipulation.herokuapp.com";

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

module.exports = class Generator extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "generator",
      description: "image meme generator",
      enabled: true,
      category: "IMAGE",
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
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
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
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setImage("attachment://attachment.png")
      .setFooter(`Requested by: ${author.tag}`);

    await interaction.followUp({ embeds: [embed], files: [attachment] });
  }
};

/**
 * @param {String} genName
 * @param {String} image
 */
function getGenerator(genName, image) {
  const endpoint = new URL(`${IMAGE_API_BASE}/generators/${genName}`);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}
