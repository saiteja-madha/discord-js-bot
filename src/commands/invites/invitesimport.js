const { getMember } = require('@schemas/Member')
const { ApplicationCommandOptionType } = require('discord.js')
const { INVITE } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'invitesimport',
  description: 'add existing guild invites to users',
  category: 'INVITE',
  botPermissions: ['ManageGuild'],
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: INVITE.ENABLED,
    options: [
      {
        name: 'user',
        description: 'the user to import invites for',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user')
    const response = await importInvites(interaction, user)
    await interaction.followUp(response)
  },
}

async function importInvites({ guild }, user) {
  if (user && user.bot) return 'Oops! You cannot import invites for bots'

  const invites = await guild.invites.fetch({ cache: false })

  // temporary store for invites
  const tempMap = new Map()

  for (const invite of invites.values()) {
    const inviter = invite.inviter
    if (!inviter || invite.uses === 0) continue
    if (!tempMap.has(inviter.id)) tempMap.set(inviter.id, invite.uses)
    else {
      const uses = tempMap.get(inviter.id) + invite.uses
      tempMap.set(inviter.id, uses)
    }
  }

  for (const [userId, uses] of tempMap.entries()) {
    const memberDb = await getMember(guild.id, userId)
    memberDb.invite_data.added += uses
    await memberDb.save()
  }

  return `Done! Previous invites added to ${user ? user.username : 'all members'}`
}
