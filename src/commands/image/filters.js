const {
  MessageEmbed,
  MessageAttachment,
  Message,
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");

const { Command } = require("@src/structures");
const { downloadImage } = require("@utils/httpUtils");
const { getImageFromCommand, getFilter } = require("@utils/imageUtils");
const { EMBED_COLORS } = require("@root/config.js");

const availableFilters = ["blur", "burn", "gay", "greyscale", "invert", "pixelate", "sepia", "sharpen"];

module.exports = class Filters extends Command {
  constructor(client) {
    super(client, {
      name: "filter",
      description: "add filter to the provided image",
      cooldown: 5,
      command: {
        enabled: true,
        aliases: availableFilters,
        category: "IMAGE",
        botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
      },
      slashCommand: {
        enabled: true,
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
    const url = getFilter(invoke.toLowerCase(), image);
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
    const filter = options.getString("name");

    let image;
    if (user) image = user.displayAvatarURL({ size: 256, format: "png" });
    if (!image && imageLink) image = imageLink;
    if (!image) image = author.displayAvatarURL({ size: 256, format: "png" });

    const url = getFilter(filter, image);
    const buffer = await downloadImage(url);

    const attachment = new MessageAttachment(buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setImage("attachment://attachment.png")
      .setFooter(`Requested by: ${author.tag}`);

    interaction.followUp({ embeds: [embed], files: [attachment] });
  }
};
