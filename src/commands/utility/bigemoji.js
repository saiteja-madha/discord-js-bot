const { parseEmoji, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { parse } = require("twemoji-parser");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bigemoji",
  description: "enlarge an emoji",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
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
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const emoji = args[0];
    const response = getEmoji(message.author, emoji);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const emoji = interaction.options.getString("emoji");
    const response = getEmoji(interaction.user, emoji);
    await interaction.followUp(response);
  },
};

function getEmoji(user, emoji) {
  const custom = parseEmoji(emoji);

  const embed = new EmbedBuilder()
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
