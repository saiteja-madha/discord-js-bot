const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");

module.exports = class DogCommand extends Command {
  constructor(client) {
    super(client, {
      name: "dog",
      description: "shows a random dog image",
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
    const response = await getJson("https://dog.ceo/api/breeds/image/random");
    if (!response.success) return message.reply(MESSAGES.API_ERROR);

    const image = response.data?.message;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setImage(image)
      .setFooter(`Requested by ${message.author.tag}`);

    message.channel.send({ embeds: [embed] });
  }
};
