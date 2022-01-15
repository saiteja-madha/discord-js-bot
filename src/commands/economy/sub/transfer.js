const { MessageEmbed } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (self, target, coins) => {
  if (isNaN(coins) || coins <= 0) return "Please enter a valid amount of coins to transfer";
  if (target.bot) return "You cannot transfer coins to bots!";
  if (target.id === self.id) return "You cannot transfer coins to self!";

  const userDb = await getUser(self.id);

  if (userDb.coins < coins) {
    return `Insufficient coin balance! You only have ${userDb.coins}${ECONOMY.CURRENCY}`;
  }

  const targetDb = await getUser(target.id);

  userDb.coins -= coins;
  targetDb.coins += coins;

  await userDb.save();
  await targetDb.save();

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Updated Balance" })
    .setDescription(
      `**${self.username}:** ${userDb.coins}${ECONOMY.CURRENCY}\n` +
        `**${target.username}:** ${targetDb.coins}${ECONOMY.CURRENCY}`
    )
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
