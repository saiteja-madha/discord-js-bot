const { MessageEmbed } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (user) => {
  const economy = await getUser(user.id);

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username })
    .setThumbnail(user.displayAvatarURL())
    .addField("Wallet", `${economy?.coins || 0}${ECONOMY.CURRENCY}`, true)
    .addField("Bank", `${economy?.bank || 0}${ECONOMY.CURRENCY}`, true)
    .addField("Net Worth", `${(economy?.coins || 0) + (economy?.bank || 0)}${ECONOMY.CURRENCY}`, true);

  return { embeds: [embed] };
};
