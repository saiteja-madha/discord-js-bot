const { EmbedBuilder } = require('discord.js')
const { getJson } = require('@helpers/HttpUtils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'epicgames',
  description: 'search for free games in epic games store last week',
  cooldown: 10,
  category: 'UTILITY',
  botPermissions: ['EmbedLinks'],
  cooldown: 1,

  slashCommand: {
    enabled: true,
    options: [],
  },

  async interactionRun(interaction) {
    const response = await searchGame(interaction.user)
    await interaction.followUp(response)
  },
}

async function searchGame(author) {
  //busca los juegos gratis en epic games store
  const response = await getJson(
    'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US'
  )

  const gamess = response.data.data.Catalog.searchStore.elements
  const matchingGames = gamess.filter(game => game.title.toLowerCase())

  if (matchingGames.length === 0) {
    const embed = new EmbedBuilder()
    embed.setColor('Random')
    embed.setTitle('Games not found')
    embed.setTimestamp()
    return { embeds: [embed] }
  }

  const embed = new EmbedBuilder()
  embed.setColor('Random')
  embed.setTitle('Free Games in Epic Games Store Last Week')
  embed.addFields(
    matchingGames.map(game => ({
      name: game.title,
      value: game.description,
      inline: false,
    }))
  )

  embed.setThumbnail(matchingGames[0].keyImages[0].url)

  embed.setTimestamp()
  return { embeds: [embed] }
}
