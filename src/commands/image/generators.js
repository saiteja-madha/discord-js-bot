const { MessageEmbed, MessageAttachment, Message } = require("discord.js");
const { Command } = require("@src/structures");
const { downloadImage } = require("@utils/httpUtils");
const { getImageFromCommand, getGenerator } = require("@utils/imageUtils");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = class Generator extends Command {
  constructor(client) {
    super(client, {
      name: "generator",
      description: "generates a meme for the provided image",
      cooldown: 5,
      command: {
        enabled: true,
        aliases: [
          "ad",
          "affect",
          "beautiful",
          "bobross",
          "color",
          "confusedstonk",
          "delete",
          "discordblack",
          "discordblue",
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
        ],
        category: "IMAGE",
        botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
      },
      slashCommand: {
        enabled: false,
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
    const buffer = await downloadImage(url);

    if (!buffer) return message.reply("Failed to generate image");

    const attachment = new MessageAttachment(buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setImage("attachment://attachment.png")
      .setFooter(`Requested by: ${message.author.tag}`);

    message.channel.send({ embeds: [embed], files: [attachment] });
  }
};
