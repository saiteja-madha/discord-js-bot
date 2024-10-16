const { banTarget } = require('@helpers/ModUtils')
const { ApplicationCommandOptionType } = require('discord.js')
const { MODERATION } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'ban',
  description: 'bans the specified member',
  category: 'MODERATION',
  botPermissions: ['BanMembers'],
  userPermissions: ['BanMembers'],
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
        description: 'reason for ban',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const target = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason')

    const response = await ban(interaction.member, target, reason)
    await interaction.followUp(response)
  },
}

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').User} target
 * @param {string} reason
 */
async function ban(issuer, target, reason) {
  const response = await banTarget(issuer, target, reason)
  if (typeof response === 'boolean') return `${target.username} is banned!`
  if (response === 'BOT_PERM')
    return `I do not have permission to ban ${target.username}`
  else if (response === 'MEMBER_PERM')
    return `You do not have permission to ban ${target.username}`
  else return `Failed to ban ${target.username}`
}
