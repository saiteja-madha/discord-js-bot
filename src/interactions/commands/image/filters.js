const { MessageEmbed, MessageAttachment, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { getBuffer } = require("@utils/httpUtils");
const { getFilter } = require("@utils/imageUtils");
const { EMBED_COLORS } = require("@root/config.js");

const availableFilters = ["blur", "burn", "gay", "greyscale", "invert", "pixelate", "sepia", "sharpen"];

module.exports = class Filters extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "filter",
      description: "add filter to the provided image",
      enabled: true,
      category: "IMAGE",
      options: [
        {
          name: "name",
          description: "the type of filter",
          type: "STRING",
          required: true,
          choices: availableFilters.map((filter) => ({ name: filter, value: filter })),
        },
        {
          name: "user",
          description: "the user to whose avatar the filter needs to applied",
          type: "USER",
          required: false,
        },
        {
          name: "link",
          description: "the image link to which the filter needs to applied",
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
    const filter = interaction.options.getString("name");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, format: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, format: "png" });

    const url = getFilter(filter, image);
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
