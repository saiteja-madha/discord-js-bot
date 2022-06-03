const { MessageEmbed, MessageAttachment } = require("discord.js");
const { getBuffer } = require("@helpers/HttpUtils");
const { getImageFromMessage } = require("@helpers/BotUtils");
const { EMBED_COLORS, IMAGE } = require("@root/config.js");

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

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
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

  async messageRun(message, args, data) {
    const image = await getImageFromMessage(message, args);

    // use invoke as an endpoint
    const url = getGenerator(data.invoke.toLowerCase(), image);
    const response = await getBuffer(url);

    if (!response.success) return message.safeReply("Failed to generate image");

    const attachment = new MessageAttachment(response.buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://attachment.png")
      .setFooter({ text: `Requested by: ${message.author.tag}` });

    await message.safeReply({ embeds: [embed], files: [attachment] });
  },

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
  },
};

function getGenerator(genName, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/generators/${genName}`);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}
