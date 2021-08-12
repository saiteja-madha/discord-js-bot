const { MessageEmbed, MessageAttachment } = require("discord.js");
const { Command, CommandContext } = require("@root/structures");
const { downloadImage } = require("@utils/httpUtils");
const { getImageFromCommand, getGenerator } = require("@utils/imageUtils");
const { EMBED_COLORS } = require("@root/config.json");

module.exports = class Generator extends Command {
  constructor(client) {
    super(client, {
      name: "generator",
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
      description: "generates a meme for the provided image",
      category: "IMAGE",
      botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, invoke } = ctx;
    const image = await getImageFromCommand(message, args);

    // use invoke as an endpoint
    const url = getGenerator(invoke.toLowerCase(), image);
    const buffer = await downloadImage(url);

    if (!buffer) return ctx.reply("Failed to generate image");

    const attachment = new MessageAttachment(buffer, "attachment.png");
    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setImage("attachment://attachment.png")
      .setFooter("Requested by: " + message.author.tag);

    ctx.reply({ embeds: [embed], files: [attachment] });
  }
};
