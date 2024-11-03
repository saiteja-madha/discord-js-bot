const { musicValidations } = require('@helpers/BotUtils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'resume',
  description: 'Resumes the music player',
  category: 'MUSIC',
  validations: musicValidations,
  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = await resumePlayer(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction} interaction
 */
async function resumePlayer({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)

  if (!player || !player.queue.current) {
    return '🚫 No song is currently playing'
  }

  if (!player.paused) return 'The player is already resumed'

  player.resume()
  return '▶️ Resumed the music player'
}
