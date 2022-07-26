const { parseEmoji, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (emoji) => {
  let custom = parseEmoji(emoji);
  if (!custom.id) return "This is not a valid guild emoji";

  let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Emoji Info" })
    .setDescription(
      `**Id:** ${custom.id}\n` + `**Name:** ${custom.name}\n` + `**Animated:** ${custom.animated ? "Yes" : "No"}`
    )
    .setImage(url);

  return { embeds: [embed] };
};
