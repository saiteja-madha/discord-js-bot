const { ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS } = require('@root/config')
const { getMemberStats, getXpLb } = require('@schemas/MemberStats')
const Canvacord = require('canvacord')
const Discord = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'rank',
  description: 'displays members rank in this server',
  category: 'STATS',
  botPermissions: ['AttachFiles'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'user',
        description: 'target user',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser('user') || interaction.user
    const member = await interaction.guild.members.fetch(user)
    const response = await getRank(interaction, member, data.settings)
    await interaction.followUp(response)
  },
}

async function getRank({ guild }, member, settings) {
  const { user } = member
  if (!settings.stats.enabled)
    return 'Stats Tracking is disabled on this server'

  const memberStats = await getMemberStats(guild.id, user.id)
  if (!memberStats.xp) return `${user.username} is not ranked yet!`

  const lb = await getXpLb(guild.id, 100)
  let pos = -1
  lb.forEach((doc, i) => {
    if (doc.member_id == user.id) {
      pos = i + 1
    }
  })

  const xpNeeded = memberStats.level * memberStats.level * 100

  const rankCard = new Canvacord.Rank()
    .setAvatar(user.displayAvatarURL({ dynamic: false, extension: 'png' }))
    .setRequiredXP(xpNeeded)
    .setCurrentXP(memberStats.xp)
    .setLevel(memberStats.level)
    .setProgressBar(EMBED_COLORS.BOT_EMBED, 'COLOR')
    .setUsername(user.username)
    .setDiscriminator(user.discriminator)
    .setStatus(member.presence.status.toString() || 'idle')
    .setRank(pos)

  try {
    const data = await rankCard.build()
    const attachment = new Discord.AttachmentBuilder(data, {
      name: 'RankCard.png',
    })
    return { files: [attachment] }
  } catch (error) {
    console.error(error)
    return 'Failed to generate rank card'
  }
}
