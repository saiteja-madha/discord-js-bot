const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.json");
const { getResponse } = require("@utils/httpUtils");

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: "cat",
      description: "shows a random cat image",
      category: "FUN",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;

    const response = await getResponse("https://api.thecatapi.com/v1/images/search");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const image = response.data[0]?.url;

    let embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setImage(image)
      .setFooter(`Requested by ${message.author.tag}`);

    ctx.reply({ embeds: [embed] });
  }
};
