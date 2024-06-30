const { inviteHandler, greetingHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");
const { AuditLogEvent } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember|import('discord.js').PartialGuildMember} member
 */
module.exports = async (client, member) => {
  if (member.partial) await member.user.fetch();
  if (!member.guild) return;

  const { guild } = member;
  const settings = await getSettings(guild);

  // Check for counter channel
  if (settings.counters.find((doc) => ["MEMBERS", "BOTS", "USERS"].includes(doc.counter_type.toUpperCase()))) {
    if (member.user.bot) {
      settings.data.bots -= 1;
      await settings.save();
    }
    if (!client.counterUpdateQueue.includes(guild.id)) client.counterUpdateQueue.push(guild.id);
  }

  // Invite Tracker
  const inviterData = await inviteHandler.trackLeftMember(guild, member.user);

  // Farewell message
  greetingHandler.sendFarewell(member, inviterData);

  // Check if member was kicked, not needed for ban since it has its event
  const log = await member.guild.fetchAuditLogs({ limit: 5 });
  if (member.user.bot) return;
  const possibleLog = log.entries.find((e) => e.action === AuditLogEvent.MemberKick && e.targetId === member.id);
  if (possibleLog) {
    const logChannel = client.channels.cache.get(settings.logging.members);
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Member kicked" })
      .setColor("Red")
      .setTitle(`${member.displayName} (\`${member.id}\` was kicked.)`)
      .setDescription(`Reason: ${possibleLog.reason || "none"}`)
      .setTimestamp()
      .setFooter({ text: `ID: ${member.id} | Executor: ${possibleLog.executor.username}` })
    logChannel.send({ embeds: [embed] })
  }
};
