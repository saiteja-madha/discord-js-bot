const { MessageEmbed } = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const { EMBED_COLORS } = require("@root/config");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "stats",
  description: "displays members stats in this server",
  cooldown: 5,
  category: "STATS",
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "target user",
        type: "USER",
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await stats(target, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const member = interaction.options.getMember("user") || interaction.member;
    const response = await stats(member, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings
 */
async function stats(member, settings) {
  if (!settings.stats.enabled) return "Stats Tracking is disabled on this server";
  const memberStats = await getMemberStats(member.guild.id, member.id);

  const embed = new MessageEmbed()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addField("User Tag", member.user.tag, true)
    .addField("ID", member.id, true)
    .addField("⌚ Member since", member.joinedAt.toLocaleString(), false)
    .addField(
      "📝 Message Stats",
      stripIndents`
      ❯ Messages Sent: ${memberStats.messages}
      ❯ Prefix Commands: ${memberStats.commands.prefix}
      ❯ Slash Commands: ${memberStats.commands.slash}
      ❯ XP Earned: ${memberStats.xp}
      ❯ Current Level: ${memberStats.level}
    `,
      false
    )
    .addField(
      "🎙️ Voice Stats",
      stripIndents`
      ❯ Total Connections: ${memberStats.voice.connections}
      ❯ Time Spent: ${memberStats.voice.time}
    `
    )
    .setFooter({ text: "Stats Generated" })
    .setTimestamp();

  return { embeds: [embed] };
}
