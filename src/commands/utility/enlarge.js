const { Util, MessageEmbed, Message } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { parse } = require("twemoji-parser");

module.exports = class EnlargeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "enlarge",
      description: "enlarge an emoji",
      command: {
        enabled: true,
        usage: "<emoji>",
        aliases: ["bigemoji"],
        minArgsCount: 1,
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS"],
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
    const { author } = message;
    if (!args) return message.reply("No emoji provided!");

    const custom = Util.parseEmoji(args);
    const embed = new MessageEmbed().setTitle("❯ Big Emoji ❮").setColor(EMBED_COLORS.BOT_EMBED).setFooter(author.tag);

    if (custom.id) {
      embed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`);
      return message.channel.send({ embeds: [embed] });
    }
    const parsed = parse(args, { assetType: "png" });
    if (!parsed[0]) return message.reply("Not a valid emoji");

    embed.setImage(parsed[0].url);
    return message.channel.send({ embeds: [embed] });
  }
};
