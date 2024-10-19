const { musicValidations } = require('@helpers/BotUtils')
const { MUSIC } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'skip',
  description: 'skip the current song',
  category: 'MUSIC',
  validations: musicValidations,
  global: true,
  slashCommand: {
    enabled: MUSIC.ENABLED,
  },

  async interactionRun(interaction) {
    const response = skip(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function skip({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)

  // check if current song is playing
  if (!player.queue.current) return '⏯️ There is no song currently being played'

  const { title } = player.queue.current
  return player.queue.next()
    ? `⏯️ ${title} was skipped.`
    : '⏯️ There is no song to skip.'
}
