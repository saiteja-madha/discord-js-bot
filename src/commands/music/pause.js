const { musicValidations } = require('@helpers/BotUtils')
const { MUSIC } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'pause',
  description: 'pause the music player',
  category: 'MUSIC',
  validations: musicValidations,

  slashCommand: {
    enabled: MUSIC.ENABLED,
  },

  async interactionRun(interaction) {
    const response = pause(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function pause({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)
  if (player.paused) return 'The player is already paused.'

  player.pause(true)
  return '⏸️ Paused the music player.'
}
