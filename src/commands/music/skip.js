const { musicValidations } = require('@helpers/BotUtils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  category: 'MUSIC',
  validations: musicValidations,

  slashCommand: {
    enabled: true,
  },

  async interactionRun(interaction) {
    const response = await skip(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function skip({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId)

  if (!player || !player.queue.current) {
    return "🚫 There's no music currently playing"
  }

  const title = player.queue.current.info.title

  if (player.queue.tracks.length === 0) {
    return 'There is no next song to skip to'
  }

  await player.skip()
  return `⏯️ ${title} was skipped`
}
