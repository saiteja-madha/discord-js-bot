const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
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
  botPermissions: ["EmbedLinks", "AttachFiles"],
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
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableGenerators.map((gen) => ({ name: gen, value: gen })),
      },
      {
        name: "user",
        description: "the user to whose avatar the generator needs to applied",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "link",
        description: "the image link to which the generator needs to applied",
        type: ApplicationCommandOptionType.String,
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

    const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
    const embed = new EmbedBuilder()
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
    if (user) image = user.displayAvatarURL({ size: 256, extension: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, extension: "png" });

    const url = getGenerator(generator, image);
    const response = await getBuffer(url);

    if (!response.success) return interaction.followUp("Failed to generate image");

    const attachment = new AttachmentBuilder(response.buffer, { name: "attachment.png" });
    const embed = new EmbedBuilder()
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
