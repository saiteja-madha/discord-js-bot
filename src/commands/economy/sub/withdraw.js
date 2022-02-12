const { MessageEmbed } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (user, coins) => {
  if (isNaN(coins) || coins <= 0) return "Please enter a valid amount of coins to deposit";
  const userDb = await getUser(user.id);

  if (coins > userDb.bank) return `You only have ${userDb.bank}${ECONOMY.CURRENCY} coins in your bank`;

  userDb.bank -= coins;
  userDb.coins += coins;
  await userDb.save();

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "New Balance" })
    .setThumbnail(user.displayAvatarURL())
    .addField("Wallet", `${userDb.coins}${ECONOMY.CURRENCY}`, true)
    .addField("Bank", `${userDb.bank}${ECONOMY.CURRENCY}`, true)
    .addField("Net Worth", `${userDb?.coins + userDb?.bank}${ECONOMY.CURRENCY}`, true);

  return { embeds: [embed] };
};
