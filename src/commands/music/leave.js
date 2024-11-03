const { musicValidations } = require('@helpers/BotUtils')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'leave',
  description: 'Disconnects the bot from the voice channel',
  category: 'MUSIC',
  validations: musicValidations,
  slashCommand: {
    enabled: true,
    options: [],
  },

  async interactionRun(interaction) {
    const response = await leave(interaction)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction} interaction
 */
async function leave({ client, guildId, member }) {
  const player = client.musicManager.getPlayer(guildId)

  player.destroy()
  return '👋 Disconnected from the voice channel'
}
