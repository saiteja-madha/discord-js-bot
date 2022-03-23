const { Util, MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { parse } = require("twemoji-parser");

module.exports = class BigEmoji extends Command {
  constructor(client) {
    super(client, {
      name: "bigemoji",
      description: "enlarge an emoji",
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "<emoji>",
        aliases: ["enlarge"],
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "emoji",
            description: "emoji to enlarge",
            type: "STRING",
            required: true,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const emoji = args[0];
    const response = getEmoji(message.author, emoji);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const emoji = interaction.options.getString("emoji");
    const response = getEmoji(interaction.user, emoji);
    await interaction.followUp(response);
  }
};

function getEmoji(user, emoji) {
  const custom = Util.parseEmoji(emoji);

  const embed = new MessageEmbed()
    .setAuthor({ name: "❯ Big Emoji ❮" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter({ text: `Requested by ${user.tag}` });

  if (custom.id) {
    embed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`);
    return { embeds: [embed] };
  }
  const parsed = parse(emoji, { assetType: "png" });
  if (!parsed[0]) return "Not a valid emoji";

  embed.setImage(parsed[0].url);
  return { embeds: [embed] };
}
