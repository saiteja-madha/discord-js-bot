const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const { EMBED_COLORS } = require('@src/config.js')
const { getJson } = require('@helpers/HttpUtils')
const { getRandomInt } = require('@helpers/Utils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'meme',
  description: '✨ Time for some giggles! Let me find you a funny meme! 🎭',
  category: 'FUN',
  cooldown: 1,
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('regenMemeBtn')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎲')
        .setLabel('Another one!')
    )

    const embed = await getRandomEmbed('dank')
    await interaction.followUp({
      embeds: [embed],
      components: [buttonRow],
    })

    const collector = interaction.channel.createMessageComponentCollector({
      filter: reactor => reactor.user.id === interaction.user.id,
    })

    collector.on('collect', async response => {
      if (response.customId !== 'regenMemeBtn') return
      await response.deferUpdate()

      const embed = await getRandomEmbed('dank')
      await interaction.editReply({
        embeds: [embed],
        components: [buttonRow],
      })
    })
  },
}

async function getRandomEmbed(category) {
  try {
    // Call the Meme API, category is always 'dank'
    const response = await getJson(`https://meme-api.com/gimme/${category}`)

    if (!response.success) {
      return new EmbedBuilder()
        .setColor(EMBED_COLORS.ERROR)
        .setDescription(
          "*pouts* Aww, the memes are being shy! Let's try again! 🎨"
        )
    }

    const meme = response.data

    // Amina's random meme reactions
    const reactions = [
      "(*≧▽≦) This one's gold!",
      '✨ Look what I found! ✨',
      'This made me giggle~ 🎭',
      'Quality meme incoming! 🌟',
    ]

    return new EmbedBuilder()
      .setAuthor({
        name: reactions[getRandomInt(reactions.length)],
        url: meme.postLink,
      })
      .setTitle(meme.title)
      .setImage(meme.url)
      .setColor('Random')
      .setFooter({
        text: `💖 ${meme.ups.toLocaleString()} upvotes | From r/${meme.subreddit}`,
      })
  } catch (error) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(
        "*dramatic gasp* The memes escaped! Don't worry, we can catch them next time! 🎨✨"
      )
  }
}
