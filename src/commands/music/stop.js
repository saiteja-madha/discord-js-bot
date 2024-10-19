const { musicValidations } = require('@helpers/BotUtils')
const { MUSIC } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'stop',
  description: 'stop the music player',
  category: 'MUSIC',
  validations: musicValidations,
  global: true,
  slashCommand: {
    enabled: MUSIC.ENABLED,
  },

  async interactionRun(interaction) {
    const response = await stop(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function stop({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)
  player.disconnect()
  await client.musicManager.destroyPlayer(guildId)
  return '🎶 The music player is stopped and queue has been cleared'
}
