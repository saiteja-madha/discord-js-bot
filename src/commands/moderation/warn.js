const { warnTarget } = require('@helpers/ModUtils')
const { ApplicationCommandOptionType } = require('discord.js')
const { MODERATION } = require('@root/config')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'warn',
  description: 'warns the specified member',
  category: 'MODERATION',
  userPermissions: ['KickMembers'],
  slashCommand: {
    enabled: MODERATION.ENABLED,
    options: [
      {
        name: 'user',
        description: 'the target member',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'reason for warn',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason')
    const target = await interaction.guild.members.fetch(user.id)

    const response = await warn(interaction.member, target, reason)
    await interaction.followUp(response)
  },
}

async function warn(issuer, target, reason) {
  const response = await warnTarget(issuer, target, reason)
  if (typeof response === 'boolean') return `${target.user.username} is warned!`
  if (response === 'BOT_PERM')
    return `I do not have permission to warn ${target.user.username}`
  else if (response === 'MEMBER_PERM')
    return `You do not have permission to warn ${target.user.username}`
  else return `Failed to warn ${target.user.username}`
}
