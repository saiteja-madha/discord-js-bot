const { kickTarget } = require('@helpers/ModUtils')
const { ApplicationCommandOptionType } = require('discord.js')
const { MODERATION } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'kick',
  description: 'Kicks the specified member',
  category: 'MODERATION',
  botPermissions: ['KickMembers'],
  userPermissions: ['KickMembers'],

  slashCommand: {
    enabled: MODERATION.ENABLED,
    data: {
      name: 'kick',
      description: 'Kicks the specified member',
      options: [
        {
          name: 'user',
          description: 'The target member',
          type: ApplicationCommandOptionType.User, // Use .User instead of .USER
          required: true,
        },
        {
          name: 'reason',
          description: 'Reason for kick',
          type: ApplicationCommandOptionType.String, // Use .String instead of .STRING
          required: false,
        },
      ],
    },
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user') // Use .getUser instead of .user
    const reason = interaction.options.getString('reason') // Use .getString instead of .string
    const target = await interaction.guild.members.fetch(user.id)

    const response = await kick(interaction.member, target, reason)
    await interaction.followUp(response)
  },
}

async function kick(issuer, target, reason) {
  const response = await kickTarget(issuer, target, reason)
  if (typeof response === 'boolean') return `${target.user.username} is kicked!`
  if (response === 'BOT_PERM')
    return `I do not have permission to kick ${target.user.username}`
  else if (response === 'MEMBER_PERM')
    return `You do not have permission to kick ${target.user.username}`
  else return `Failed to kick ${target.user.username}`
}
