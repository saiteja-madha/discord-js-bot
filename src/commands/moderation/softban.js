const { softbanTarget } = require('@helpers/ModUtils')
const { ApplicationCommandOptionType } = require('discord.js')
const { MODERATION } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'softban',
  description: 'softban the specified member. Kicks and deletes messages',
  category: 'MODERATION',
  botPermissions: ['BanMembers'],
  userPermissions: ['KickMembers'],
  global: true,
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
        description: 'reason for softban',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason')
    const target = await interaction.guild.members.fetch(user.id)

    const response = await softban(interaction.member, target, reason)
    await interaction.followUp(response)
  },
}

async function softban(issuer, target, reason) {
  const response = await softbanTarget(issuer, target, reason)
  if (typeof response === 'boolean')
    return `${target.user.username} is soft-banned!`
  if (response === 'BOT_PERM')
    return `I do not have permission to softban ${target.user.username}`
  else if (response === 'MEMBER_PERM')
    return `You do not have permission to softban ${target.user.username}`
  else return `Failed to softban ${target.user.username}`
}
