const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { getJson } = require('@helpers/HttpUtils')
const { MESSAGES, EMBED_COLORS } = require('@src/config')

const BASE_URL = 'https://some-random-api.com/lyrics'

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'lyric',
  description: 'find lyric of the song',
  category: 'MUSIC',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'query',
        type: ApplicationCommandOptionType.String,
        description: 'find lyric of the song',
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('query')
    const response = await getLyric(interaction.user, choice)
    await interaction.followUp(response)
  },
}

async function getLyric(user, choice) {
  const lyric = await getJson(`${BASE_URL}?title=${choice}`)
  if (!lyric.success) return MESSAGES.API_ERROR

  const thumbnail = lyric.data?.thumbnail.genius
  const author = lyric.data?.author
  const lyrics = lyric.data?.lyrics
  const title = lyric.data?.title

  const embed = new EmbedBuilder()
  embed
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`${author} - ${title}`)
    .setThumbnail(thumbnail)
    .setDescription(lyrics)
    .setFooter({ text: `Request By: ${user.username}` })

  return { embeds: [embed] }
}
