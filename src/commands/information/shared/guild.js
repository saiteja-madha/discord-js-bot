const { EmbedBuilder, ChannelType, GuildVerificationLevel } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const moment = require("moment");

/**
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (guild) => {
  const { name, id, preferredLocale, channels, roles, ownerId } = guild;

  const owner = await guild.members.fetch(ownerId);
  const createdAt = moment(guild.createdAt);

  const totalChannels = channels.cache.size;
  const categories = channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
  const textChannels = channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  ).size;
  const threadChannels = channels.cache.filter(
    (c) => c.type === ChannelType.PrivateThread || c.type === ChannelType.PublicThread
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
    case GuildVerificationLevel.VeryHigh:
      verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
      break;

    case GuildVerificationLevel.High:
      verificationLevel = "(╯°□°）╯︵ ┻�?┻";
      break;

    default:
      break;
  }

  let desc = "";
  desc = `${desc + "❯"} **Id:** ${id}\n`;
  desc = `${desc + "❯"} **Name:** ${name}\n`;
  desc = `${desc + "❯"} **Owner:** ${owner.user.username}\n`;
  desc = `${desc + "❯"} **Region:** ${preferredLocale}\n`;
  desc += "\n";

  const embed = new EmbedBuilder()
    .setTitle("GUILD INFORMATION")
    .setThumbnail(guild.iconURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: `Server Members [${all}]`,
        value: `\`\`\`Members: ${users}\nBots: ${bots}\`\`\``,
        inline: true,
      },
      {
        name: `Online Stats [${onlineAll}]`,
        value: `\`\`\`Members: ${onlineUsers}\nBots: ${onlineBots}\`\`\``,
        inline: true,
      },
      {
        name: `Categories and channels [${totalChannels}]`,
        value: `\`\`\`Categories: ${categories} | Text: ${textChannels} | Voice: ${voiceChannels} | Thread: ${threadChannels}\`\`\``,
        inline: false,
      },
      {
        name: `Roles [${rolesCount}]`,
        value: `\`\`\`${rolesString}\`\`\``,
        inline: false,
      },
      {
        name: "Verification",
        value: `\`\`\`${verificationLevel}\`\`\``,
        inline: true,
      },
      {
        name: "Boost Count",
        value: `\`\`\`${guild.premiumSubscriptionCount}\`\`\``,
        inline: true,
      },
      {
        name: `Server Created [${createdAt.fromNow()}]`,
        value: `\`\`\`${createdAt.format("dddd, Do MMMM YYYY")}\`\`\``,
        inline: false,
      }
    );

  if (guild.splashURL()) embed.setImage(guild.splashURL({ extension: "png", size: 256 }));

  return { embeds: [embed] };
};
