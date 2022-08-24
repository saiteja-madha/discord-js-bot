const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
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
        type: ApplicationCommandOptionType.User,
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

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "User Tag",
        value: member.user.tag,
        inline: true,
      },
      {
        name: "ID",
        value: member.id,
        inline: true,
      },
      {
        name: "⌚ Member since",
        value: member.joinedAt.toLocaleString(),
        inline: false,
      },
      {
        name: "💬 Messages sent",
        value: stripIndents`
      ❯ Messages Sent: ${memberStats.messages}
      ❯ Prefix Commands: ${memberStats.commands.prefix}
      ❯ Slash Commands: ${memberStats.commands.slash}
      ❯ XP Earned: ${memberStats.xp}
      ❯ Current Level: ${memberStats.level}
    `,
        inline: false,
      },
      {
        name: "🎙️ Voice Stats",
        value: stripIndents`
      ❯ Total Connections: ${memberStats.voice.connections}
      ❯ Time Spent: ${Math.floor(memberStats.voice.time / 60)} min
    `,
      }
    )
    .setFooter({ text: "Stats Generated" })
    .setTimestamp();

  return { embeds: [embed] };
}
