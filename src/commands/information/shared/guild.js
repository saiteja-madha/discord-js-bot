const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const moment = require("moment");

module.exports = async (guild) => {
  const { name, id, preferredLocale, channels, roles, ownerId } = guild;

  const owner = await guild.members.fetch(ownerId);
  const createdAt = moment(guild.createdAt);

  const totalChannels = channels.cache.size;
  const categories = channels.cache.filter((c) => c.type === "GUILD_CATEGORY").size;
  const textChannels = channels.cache.filter((c) => c.type === "GUILD_TEXT").size;
  const voiceChannels = channels.cache.filter((c) => c.type === "GUILD_VOICE" || c.type === "GUILD_STAGE_VOICE").size;
  const threadChannels = channels.cache.filter(
    (c) => c.type === "GUILD_PRIVATE_THREAD" || c.type === "GUILD_PUBLIC_THREAD"
  ).size;

  const memberCache = guild.members.cache;
  const all = memberCache.size;
  const bots = memberCache.filter((m) => m.user.bot).size;
  const users = all - bots;
  const onlineUsers = memberCache.filter((m) => !m.user.bot && m.presence?.status === "online").size;
  const onlineBots = memberCache.filter((m) => m.user.bot && m.presence?.status === "online").size;
  const onlineAll = onlineUsers + onlineBots;
  const rolesCount = roles.cache.size;

  const getMembersInRole = (members, role) => {
    return members.filter((m) => m.roles.cache.has(role.id)).size;
  };

  let rolesString = roles.cache
    .filter((r) => !r.name.includes("everyone"))
    .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
    .join(", ");

  if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...";

  let { verificationLevel } = guild;
  switch (guild.verificationLevel) {
    case "VERY_HIGH":
      verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
      break;

    case "HIGH":
      verificationLevel = "(╯°□°）╯︵ ┻�?┻";
      break;

    default:
      break;
  }

  let desc = "";
  desc = `${desc + "❯"} **Id:** ${id}\n`;
  desc = `${desc + "❯"} **Name:** ${name}\n`;
  desc = `${desc + "❯"} **Owner:** ${owner.user.tag}\n`;
  desc = `${desc + "❯"} **Region:** ${preferredLocale}\n`;
  desc += "\n";

  const embed = new MessageEmbed()
    .setTitle("GUILD INFORMATION")
    .setThumbnail(guild.iconURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addField(`Server Members [${all}]`, `\`\`\`Members: ${users}\nBots: ${bots}\`\`\``, true)
    .addField(`Online Stats [${onlineAll}]`, `\`\`\`Members: ${onlineUsers}\nBots: ${onlineBots}\`\`\``, true)
    .addField(
      `Categories and channels [${totalChannels}]`,
      `\`\`\`Categories: ${categories} | Text: ${textChannels} | Voice: ${voiceChannels} | Thread: ${threadChannels}\`\`\``,
      false
    )
    .addField(`Roles [${rolesCount}]`, `\`\`\`${rolesString}\`\`\``, false)
    .addField("Verification", `\`\`\`${verificationLevel}\`\`\``, true)
    .addField("Boost Count", `\`\`\`${guild.premiumSubscriptionCount}\`\`\``, true)
    .addField(
      `Server Created [${createdAt.fromNow()}]`,
      `\`\`\`${createdAt.format("dddd, Do MMMM YYYY")}\`\`\``,
      false
    );

  if (guild.splashURL) embed.setImage(guild.splashURL);

  return { embeds: [embed] };
};
