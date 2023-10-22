const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'levelup',
  description: 'configure the levelling system',
  category: 'STATS',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'message',
        description: 'set custom level up message',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'message',
            description: 'message to display when a user levels up',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'channel',
        description: 'set the channel to send level up messages to',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'channel to send level up messages to',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    let response

    if (sub === 'message')
      response = await setMessage(
        interaction.options.getString('message'),
        data.settings
      )
    else if (sub === 'channel')
      response = await setChannel(
        interaction.options.getChannel('channel'),
        data.settings
      )
    else response = 'Invalid subcommand'

    await interaction.followUp(response)
  },
}

async function setMessage(message, settings) {
  if (!message) return 'Invalid message. Please provide a message'
  settings.stats.xp.message = message
  await settings.save()
  return `Configuration saved. Level up message updated!`
}

async function setChannel(channel, settings) {
  if (!channel) return 'Invalid channel. Please provide a channel'

  if (channel === 'off') settings.stats.xp.channel = null
  else settings.stats.xp.channel = channel.id

  await settings.save()
  return `Configuration saved. Level up channel updated!`
}
