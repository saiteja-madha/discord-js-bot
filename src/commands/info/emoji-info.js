const { Command } = require("@src/structures");
const { Message, Util, MessageEmbed } = require("discord.js");

module.exports = class EmojiInfo extends Command {
  constructor(client) {
    super(client, {
      name: "emojiinfo",
      description: "shows info about an emoji",
      command: {
        enabled: true,
        usage: "<emoji>",
        minArgsCount: 1,
        aliases: ["emoji"],
        category: "INFORMATION",
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
  async messageRun(message, args) {
    const emoji = args[0];
    let custom = Util.parseEmoji(emoji);
    if (!custom.id) return message.channel.send("This is not a valid guild emoji");

    let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

    const embed = new MessageEmbed()
      .setColor(this.client.config.EMBED_COLORS.BOT_EMBED)
      .setAuthor("Emoji Info")
      .setDescription(
        `**Id:** ${custom.id}\n` + `**Name:** ${custom.name}\n` + `**Animated:** ${custom.animated ? "Yes" : "No"}`
      )
      .setImage(url);

    return message.channel.send({ embeds: [embed] });
  }
};
