const { musicValidations } = require('@helpers/BotUtils')
const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'seek',
  description: 'Sets the position of the current track',
  category: 'MUSIC',
  validations: musicValidations,

  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'time',
        description: 'The time you want to seek to',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const time = interaction.client.utils.parseTime(
      interaction.options.getString('time')
    )
    if (!time) {
      return await interaction.followUp(
        'Invalid time format. Use 10s, 1m 50s, 1h'
      )
    }
    const response = await seekTo(interaction, time)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction} interaction
 * @param {number} time
 */
async function seekTo({ client, guildId }, time) {
  const player = client.musicManager.getPlayer(guildId)

  if (!player || !player.queue.current) {
    return "🚫 There's no music currently playing"
  }

  if (time > player.queue.current.length) {
    return 'The duration you provided exceeds the duration of the current track'
  }

  player.seek(time)
  return `Seeked song duration to **${client.utils.formatTime(time)}**`
}
