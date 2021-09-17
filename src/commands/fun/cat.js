const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: "cat",
      description: "shows a random cat image",
      cooldown: 5,
      command: {
        enabled: true,
        category: "FUN",
        botPermissions: ["EMBED_LINKS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const response = await getResponse("https://api.thecatapi.com/v1/images/search");
    if (!response.success) return message.reply(MESSAGES.API_ERROR);

    const image = response.data[0]?.url;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setImage(image)
      .setFooter(`Requested by ${message.author.tag}`);

    message.channel.send({ embeds: [embed] });
  }
};
