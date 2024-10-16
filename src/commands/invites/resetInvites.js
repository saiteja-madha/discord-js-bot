const { getMember } = require('@schemas/Member')
const { ApplicationCommandOptionType } = require('discord.js')
const { checkInviteRewards } = require('@handlers/invite')
const { INVITE } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'resetinvites',
  description: "Clear a user's added invites",
  category: 'INVITE',
  userPermissions: ['ManageGuild'],
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: INVITE.ENABLED,
    options: [
      {
        name: 'user',
        description: 'the user to clear invites for',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user')
    const response = await clearInvites(interaction, user)
    await interaction.followUp(response)
  },
}

async function clearInvites({ guild }, user) {
  const memberDb = await getMember(guild.id, user.id)
  memberDb.invite_data.added = 0
  await memberDb.save()
  checkInviteRewards(guild, memberDb, false)
  return `Done! Invites cleared for \`${user.username}\``
}
