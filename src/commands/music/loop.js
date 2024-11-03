const { musicValidations } = require('@helpers/BotUtils')
const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'loop',
  description: 'loops the song or queue',
  category: 'MUSIC',
  validations: musicValidations,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'type',
        type: ApplicationCommandOptionType.String,
        description: 'Select loop type',
        required: false,
        choices: [
          { name: 'Track', value: 'track' },
          { name: 'Queue', value: 'queue' },
          { name: 'Off', value: 'off' },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString('type') || 'track'
    const response = await toggleLoop(interaction, type)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {"queue"|"track"|"off"} type
 */
async function toggleLoop({ client, guildId }, type) {
  const player = client.musicManager.getPlayer(guildId)

  if (!player || !player.queue.current) {
    return '🚫 No song is currently playing'
  }

  switch (type) {
    case 'track':
      player.setRepeatMode('track')
      return 'Loop mode is set to `track`'

    case 'queue':
      if (player.queue.tracks.length > 1) {
        player.setRepeatMode('queue')
        return 'Loop mode is set to `queue`'
      } else {
        return '🚫 Queue is too short to be looped'
      }

    case 'off':
      player.setRepeatMode('off')
      return 'Loop mode is disabled'

    default:
      return 'Invalid loop type'
  }
}
