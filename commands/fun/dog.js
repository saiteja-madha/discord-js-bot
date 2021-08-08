const { Command, CommandContext } = require("@root/command");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.json");
const { getResponse } = require("@utils/httpUtils");

module.exports = class DogCommand extends Command {
  constructor(client) {
    super(client, {
      name: "dog",
      description: "shows a random dog image",
      category: "FUN",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;

    const response = await getResponse("https://dog.ceo/api/breeds/image/random");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const image = response.data?.message;

    let embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setImage(image)
      .setFooter(`Requested by ${message.author.tag}`);

    ctx.reply({ embeds: [embed] });
  }
};
