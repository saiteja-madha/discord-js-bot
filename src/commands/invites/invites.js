const { getEffectiveInvites } = require('@handlers/invite')
const { EMBED_COLORS } = require('@root/config.js')
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { getMember } = require('@schemas/Member')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'invites',
  description: 'Shows the number of invites in this server',
  category: 'INVITE',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'user',
        description: 'the user to get the invites for',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser('user') || interaction.user
    const response = await getInvites(interaction, user, data.settings)
    await interaction.followUp(response)
  },
}

async function getInvites({ guild }, user, settings) {
  if (!settings.invite.tracking)
    return `Invite tracking is disabled in this server`

  const inviteData = (await getMember(guild.id, user.id)).invite_data

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Invites for ${user.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(
      `${user.toString()} has ${getEffectiveInvites(inviteData)} invites`
    )
    .addFields(
      {
        name: 'Total Invites',
        value: `**${inviteData?.tracked + inviteData?.added || 0}**`,
        inline: true,
      },
      {
        name: 'Fake Invites',
        value: `**${inviteData?.fake || 0}**`,
        inline: true,
      },
      {
        name: 'Left Invites',
        value: `**${inviteData?.left || 0}**`,
        inline: true,
      }
    )

  return { embeds: [embed] }
}
