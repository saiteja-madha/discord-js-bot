const { musicValidations } = require('@helpers/BotUtils')
const { autoplayFunction } = require('@handlers/player')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'autoplay',
  description: 'Toggle autoplay feature for music player',
  category: 'MUSIC',
  validations: musicValidations,
  slashCommand: {
    enabled: true,
    options: [],
  },

  async interactionRun(interaction) {
    const response = await toggleAutoplay(interaction)
    await interaction.followUp(response)
  },
}

async function toggleAutoplay({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)

  if (!player || !player.queue.current) {
    return '🚫 No song is currently playing'
  }

  const autoplayState = player.get('autoplay')

  if (autoplayState) {
    player.set('autoplay', false)
    return 'Autoplay deactivated'
  }

  player.set('autoplay', true)
  autoplayFunction(client, player.queue.current, player)

  return 'Autoplay activated!'
}
