const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getBuffer } = require("@helpers/HttpUtils");
const { getImageFromMessage } = require("@helpers/BotUtils");
const { EMBED_COLORS, IMAGE } = require("@root/config.js");

const availableFilters = ["blur", "burn", "gay", "greyscale", "invert", "pixelate", "sepia", "sharpen"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "filter",
  description: "add filter to the provided image",
  cooldown: 5,
  category: "IMAGE",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    aliases: availableFilters,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "name",
        description: "the type of filter",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableFilters.map((filter) => ({ name: filter, value: filter })),
      },
      {
        name: "user",
        description: "the user to whose avatar the filter needs to applied",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "link",
        description: "the image link to which the filter needs to applied",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const image = await getImageFromMessage(message, args);

    // use invoke as an endpoint
    const url = getFilter(data.invoke.toLowerCase(), image);
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
    const filter = interaction.options.getString("name");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, extension: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, extension: "png" });

    const url = getFilter(filter, image);
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

function getFilter(filter, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/filters/${filter}`);
  endpoint.searchParams.append("image", image);
  return endpoint.href;
}
