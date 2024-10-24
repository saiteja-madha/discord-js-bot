const { musicValidations } = require('@helpers/BotUtils')
const { LoopType } = require('@lavaclient/queue')
const { ApplicationCommandOptionType } = require('discord.js')
const { MUSIC } = require('@root/config.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'loop',
  description: 'loops the song or queue',
  category: 'MUSIC',
  validations: musicValidations,

  slashCommand: {
    enabled: MUSIC.ENABLED,
    options: [
      {
        name: 'type',
        type: ApplicationCommandOptionType.String,
        description: 'The entity you want to loop',
        required: false,
        choices: [
          {
            name: 'queue',
            value: 'queue',
          },
          {
            name: 'track',
            value: 'track',
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString('type') || 'track'
    const response = toggleLoop(interaction, type)
    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {"queue"|"track"} type
 */
function toggleLoop({ client, guildId }, type) {
  const player = client.musicManager.getPlayer(guildId)

  // track
  if (type === 'track') {
    player.queue.setLoop(LoopType.Song)
    return 'Loop mode is set to `track`'
  }

  // queue
  else if (type === 'queue') {
    player.queue.setLoop(1)
    return 'Loop mode is set to `queue`'
  }
}
