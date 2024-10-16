const { getEffectiveInvites, checkInviteRewards } = require('@handlers/invite')
const { EMBED_COLORS, INVITE } = require('@root/config.js')
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { getMember } = require('@schemas/Member')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'addinvites',
  description: 'Add invites to a member',
  category: 'INVITE',
  userPermissions: ['ManageGuild'],
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: INVITE.ENABLED,
    options: [
      {
        name: 'user',
        description: 'the user to give invites to',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'invites',
        description: 'the number of invites to give',
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user')
    const amount = interaction.options.getInteger('invites')
    const response = await addInvites(interaction, user, amount)
    await interaction.followUp(response)
  },
}

async function addInvites({ guild }, user, amount) {
  if (user.bot) return 'Oops! You cannot add invites to bots'

  const memberDb = await getMember(guild.id, user.id)
  memberDb.invite_data.added += amount
  await memberDb.save()

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Added invites to ${user.username}` })
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(
      `${user.username} now has ${getEffectiveInvites(memberDb.invite_data)} invites`
    )

  checkInviteRewards(guild, memberDb, true)
  return { embeds: [embed] }
}
