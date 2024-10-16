const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS, INVITE } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'invitecodes',
  description: 'List all your invite codes in this guild',
  category: 'INVITE',
  botPermissions: ['EmbedLinks', 'ManageGuild'],
  slashCommand: {
    enabled: INVITE.ENABLED,
    options: [
      {
        name: 'user',
        description: 'the user to get the invite codes for',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser('user') || interaction.user
    const response = await getInviteCodes(interaction, user)
    await interaction.followUp(response)
  },
}

async function getInviteCodes({ guild }, user) {
  const invites = await guild.invites.fetch({ cache: false })
  const reqInvites = invites.filter(inv => inv.inviter.id === user.id)
  if (reqInvites.size === 0)
    return `\`${user.username}\` has no invites in this server`

  let str = ''
  reqInvites.forEach(inv => {
    str += `❯ [${inv.code}](${inv.url}) : ${inv.uses} uses\n`
  })

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Invite code for ${user.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(str)

  return { embeds: [embed] }
}
