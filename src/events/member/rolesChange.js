const { EmbedBuilder, AuditLogEvent } = require('discord.js')
const { getSettings } = require('@schemas/Guild')
const { EMBED_COLORS } = require('@root/config')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember} oldMember
 * @param {import('discord.js').GuildMember} newMember
 */
module.exports = async (client, oldMember, newMember) => {
  // Ignore if the guild is unavailable
  if (!newMember.guild.available) return

  const settings = await getSettings(newMember.guild)

  // Check if logging is enabled and a log channel is set
  if (!settings.logs.enabled || !settings.logs_channel) return

  // Check if role change logging is specifically enabled
  if (!settings.logs.member.role_changes) return

  const logChannel = newMember.guild.channels.cache.get(settings.logs_channel)
  if (!logChannel) return

  const oldRoles = oldMember.roles.cache
  const newRoles = newMember.roles.cache

  // Determine added and removed roles
  const addedRoles = newRoles.filter(role => !oldRoles.has(role.id))
  const removedRoles = oldRoles.filter(role => !newRoles.has(role.id))

  if (addedRoles.size === 0 && removedRoles.size === 0) return // No role changes

  // Fetch the audit log to get the user who made the change
  const auditLogs = await newMember.guild.fetchAuditLogs({
    type: AuditLogEvent.MemberRoleUpdate,
    limit: 1,
  })

  const roleUpdateLog = auditLogs.entries.first()
  const executor = roleUpdateLog ? roleUpdateLog.executor : null

  const embed = new EmbedBuilder()
    .setTitle('Member Roles Updated')
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`Roles were updated for ${newMember.user.tag}`)
    .addFields(
      {
        name: 'Member',
        value: `${newMember.user.tag} (${newMember.id})`,
        inline: true,
      },
      {
        name: 'Updated by',
        value: executor ? `${executor.tag} (${executor.id})` : 'Unknown',
        inline: true,
      },
      {
        name: 'Added Roles',
        value:
          addedRoles.size > 0 ? addedRoles.map(r => r.name).join(', ') : 'None',
        inline: false,
      },
      {
        name: 'Removed Roles',
        value:
          removedRoles.size > 0
            ? removedRoles.map(r => r.name).join(', ')
            : 'None',
        inline: false,
      }
    )
    .setTimestamp()

  logChannel.safeSend({ embeds: [embed] })
}
