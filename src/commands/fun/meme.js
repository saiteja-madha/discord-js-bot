const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { getJson } = require('@helpers/HttpUtils')
const { getRandomInt } = require('@helpers/Utils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'meme',
  description: 'Get a random meme',
  category: 'FUN',
  cooldown: 1,
  global: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'category',
        description: 'Meme category',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('category')

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('regenMemeBtn')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔁')
    )
    const embed = await getRandomEmbed(choice)

    await interaction.followUp({
      embeds: [embed],
      components: [buttonRow],
    })

    const collector = interaction.channel.createMessageComponentCollector({
      filter: reactor => reactor.user.id === interaction.user.id,
      time: 20 * 1000, // Adjust the cooldown as needed
      max: 3,
      dispose: true,
    })

    collector.on('collect', async response => {
      if (response.customId !== 'regenMemeBtn') return
      await response.deferUpdate()

      const embed = await getRandomEmbed(choice)
      await interaction.editReply({
        embeds: [embed],
        components: [buttonRow],
      })
    })

    collector.on('end', () => {
      buttonRow.components.forEach(button => button.setDisabled(true))
      return interaction.editReply({
        components: [buttonRow],
      })
    })
  },
}

async function getRandomEmbed(choice) {
  const subReddits = ['meme', 'Memes_Of_The_Dank', 'memes', 'dankmemes']
  let rand = choice ? choice : subReddits[getRandomInt(subReddits.length)]

  const response = await getJson(
    `https://www.reddit.com/r/${rand}/random/.json`
  )
  if (!response.success) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription('Failed to fetch a meme. Try again!')
  }

  const json = response.data
  if (!Array.isArray(json) || json.length === 0) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(`No meme found matching ${choice}`)
  }

  try {
    let permalink = json[0].data.children[0].data.permalink
    let memeUrl = `https://reddit.com${permalink}`
    let memeImage = json[0].data.children[0].data.url
    let memeTitle = json[0].data.children[0].data.title
    let memeUpvotes = json[0].data.children[0].data.ups
    let memeNumComments = json[0].data.children[0].data.num_comments

    return new EmbedBuilder()
      .setAuthor({ name: memeTitle, url: memeUrl })
      .setImage(memeImage)
      .setColor('Random')
      .setFooter({ text: `👍 ${memeUpvotes} | 💬 ${memeNumComments}` })
  } catch (error) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription('Failed to fetch a meme. Try again!')
  }
}
