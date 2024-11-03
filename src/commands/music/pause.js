const { musicValidations } = require('@helpers/BotUtils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'pause',
  description: 'Pause the music player',
  category: 'MUSIC',
  validations: musicValidations,

  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = await pause(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction} interaction
 */
async function pause({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)

  if (!player || !player.queue.current) {
    return '🚫 No song is currently playing'
  }

  if (player.paused) {
    return 'The player is already paused'
  }

  player.pause()
  return '⏸️ Paused the music player'
}
