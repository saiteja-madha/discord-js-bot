const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (user) => {
  const economy = await getUser(user);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username })
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {
        name: "Wallet",
        value: `${economy?.coins || 0}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Bank",
        value: `${economy?.bank || 0}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Net Worth",
        value: `${(economy?.coins || 0) + (economy?.bank || 0)}${ECONOMY.CURRENCY}`,
        inline: true,
      }
    );

  return { embeds: [embed] };
};
