const { MessageEmbed } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const { getUser } = require("@schemas/User");
const { getMember } = require("@schemas/Member");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async ({ guild }, user) => {
  const settings = await getSettings(guild);
  const memberData = await getMember(guild.id, user.id);
  const userData = await getUser(user.id);

  const embed = new MessageEmbed()
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addField("User Tag", user.tag, true)
    .addField("ID", user.id, true)
    .addField("Discord Registered", user.createdAt.toDateString(), false)
    .addField("Cash", `${userData.coins} ${ECONOMY.CURRENCY}`, true)
    .addField("Bank", `${userData.bank} ${ECONOMY.CURRENCY}`, true)
    .addField("Net Worth", `${userData.coins + userData.bank}${ECONOMY.CURRENCY}`, true)
    .addField("Reputation", `${userData.reputation.received}`, true)
    .addField("Daily Streak", `${userData.daily.streak}`, true)
    .addField("XP*", `${settings.ranking.enabled ? memberData.xp + " " : "Not Tracked"}`, true)
    .addField("Level*", `${settings.ranking.enabled ? memberData.level + " " : "Not Tracked"}`, true)
    .addField("Strikes*", memberData.strikes + " ", true)
    .addField("Warnings*", memberData.warnings + " ", true)
    .addField("Avatar-URL", user.displayAvatarURL({ format: "png" }))
    .setFooter({ text: "Fields marked (*) are guild specific" });

  return { embeds: [embed] };
};
