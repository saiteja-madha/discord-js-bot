const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const axios = require('axios')
const { EMBED_COLORS } = require('@root/config')

const choices = [
  'bite',
  'blush',
  'cringe',
  'cuddle',
  'kiss',
  'pat',
  'slap',
  'wink',
  'wave',
  'kill',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'react',
  description: 'Anime reactions.',
  enabled: true,
  category: 'ANIME',

  slashCommand: {
    enabled: true,
    description: 'Send an anime reaction.',
    options: [
      {
        name: 'reaction',
        description: 'Reaction type',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: choices.map(ch => ({ name: ch, value: ch })),
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('reaction')
    const embed = await genReaction(choice, interaction.user)
    await interaction.followUp({ embeds: [embed] })
  },
}

const genReaction = async (reaction, user) => {
  try {
    // Fetch reaction image from Waifu.pics API
    const response = await axios.get(`https://api.waifu.pics/sfw/${reaction}`)
    const imageUrl = response.data.url

    return new EmbedBuilder()
      .setImage(imageUrl)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setFooter({ text: `Requested By ${user.username}` })
  } catch (ex) {
    console.error('Error fetching reaction:', ex)
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription('Failed to fetch reaction. Try again!')
      .setFooter({ text: `Requested By ${user.username}` })
  }
}
