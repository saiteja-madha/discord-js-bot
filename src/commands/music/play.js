const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS, MUSIC } = require('@src/config')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'play',
  description: 'Play or queue your favorite song!',
  category: 'MUSIC',
  botPermissions: ['EmbedLinks'],

  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'query',
        description: 'song name or url',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const searchQuery = interaction.options.getString('query')
    const response = await play(interaction, searchQuery)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function play({ member, guild, channel }, searchQuery) {
  if (!member.voice.channel) return '🚫 You need to join a voice channel first'

  let player = guild.client.musicManager.getPlayer(guild.id)

  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return '🚫 You must be in the same voice channel as mine'
  }

  if (!player) {
    player = await guild.client.musicManager.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channel.id,
      textChannelId: channel.id,
      selfMute: false,
      selfDeaf: true,
      volume: MUSIC.DEFAULT_VOLUME,
    })
  }

  if (!player.connected) await player.connect()

  try {
    const res = await player.search({ query: searchQuery }, member.user)

    if (!res || res.loadType === 'empty') {
      return `🚫 No results found for "${searchQuery}"`
    }

    switch (res?.loadType) {
      case 'error':
        guild.client.logger.error('Search Exception', res.exception)
        return '🚫 There was an error while searching'

      case 'playlist':
        player.queue.add(res.tracks)

        const playlistEmbed = new EmbedBuilder()
          .setAuthor({ name: 'Added Playlist to queue' })
          .setThumbnail(res.playlist.thumbnail)
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setDescription(`[${res.playlist.name}](${res.playlist.uri})`)
          .addFields(
            {
              name: 'Enqueued',
              value: `${res.tracks.length} songs`,
              inline: true,
            },
            {
              name: 'Playlist duration',
              value:
                '`' +
                guild.client.utils.formatTime(
                  res.tracks
                    .map(t => t.info.duration)
                    .reduce((a, b) => a + b, 0)
                ) +
                '`',
              inline: true,
            }
          )
          .setFooter({ text: `Requested By: ${member.user.username}` })

        if (!player.playing && player.queue.tracks.length > 0) {
          await player.play({ paused: false })
        }

        return { embeds: [playlistEmbed] }

      case 'track':
      case 'search': {
        const track = res.tracks[0]
        player.queue.add(track)

        const trackEmbed = new EmbedBuilder()
          .setAuthor({ name: 'Added Track to queue' })
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setDescription(`[${track.info.title}](${track.info.uri})`)
          .setThumbnail(track.info.artworkUrl)
          .addFields({
            name: 'Song Duration',
            value:
              '`' + guild.client.utils.formatTime(track.info.duration) + '`',
            inline: true,
          })
          .setFooter({ text: `Requested By: ${track.requester.username}` })

        if (player.queue?.tracks?.length > 1) {
          trackEmbed.addFields({
            name: 'Position in Queue',
            value: player.queue.tracks.length.toString(),
            inline: true,
          })
        }

        if (!player.playing && player.queue.tracks.length > 0) {
          await player.play({ paused: false })
        }

        return { embeds: [trackEmbed] }
      }

      default:
        guild.client.logger.debug('Unknown loadType', res)
        return '🚫 An error occurred while searching for the song'
    }
  } catch (error) {
    guild.client.logger.error('Search Exception', JSON.stringify(error))
    return '🚫 An error occurred while searching for the song'
  }
}
