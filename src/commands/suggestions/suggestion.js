const { approveSuggestion, rejectSuggestion } = require('@handlers/suggestion')
const { parsePermissions } = require('@helpers/Utils')
const { SUGGESTIONS } = require('@root/config')
const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

const CHANNEL_PERMS = [
  'ViewChannel',
  'SendMessages',
  'EmbedLinks',
  'ManageMessages',
  'ReadMessageHistory',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'suggestion',
  description: 'configure suggestion system',
  category: 'SUGGESTION',
  userPermissions: ['ManageGuild'],

  slashCommand: {
    enabled: SUGGESTIONS.ENABLED,
    ephemeral: true,
    options: [
      {
        name: 'status',
        description: 'enable or disable suggestion status',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'enabled or disabled',
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: 'ON',
                value: 'ON',
              },
              {
                name: 'OFF',
                value: 'OFF',
              },
            ],
          },
        ],
      },
      {
        name: 'channel',
        description: 'configure suggestion channel or disable it',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel_name',
            description: 'the channel where suggestions will be sent',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: 'appch',
        description: 'configure approved suggestions channel or disable it',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel_name',
            description: 'the channel where approved suggestions will be sent',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: 'rejch',
        description: 'configure rejected suggestions channel or disable it',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel_name',
            description: 'the channel where rejected suggestions will be sent',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: 'approve',
        description: 'approve a suggestion',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel_name',
            description: 'the channel where the suggestion exists',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: 'message_id',
            description: 'the message id of the suggestion',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'reason',
            description: 'the reason for the approval',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: 'reject',
        description: 'reject a suggestion',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel_name',
            description: 'the channel where the suggestion exists',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: 'message_id',
            description: 'the message id of the suggestion',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: 'reason',
            description: 'the reason for the rejection',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    let response

    // status
    if (sub === 'status') {
      const status = interaction.options.getString('status')
      response = await setStatus(data.settings, status)
    }

    // channel
    else if (sub === 'channel') {
      const channel = interaction.options.getChannel('channel_name')
      response = await setChannel(data.settings, channel)
    }

    // approved channel
    else if (sub === 'appch') {
      const channel = interaction.options.getChannel('channel_name')
      response = await setApprovedChannel(data.settings, channel)
    }

    // rejected channel
    else if (sub === 'rejch') {
      const channel = interaction.options.getChannel('channel_name')
      response = await setRejectedChannel(data.settings, channel)
    }

    // approve suggestion
    else if (sub === 'approve') {
      const channel = interaction.options.getChannel('channel_name')
      const messageId = interaction.options.getString('message_id')
      const reason =
        interaction.options.getString('reason') || 'No reason provided'
      response = await approveSuggestion(
        interaction.member,
        channel,
        messageId,
        reason
      )
    }

    // reject suggestion
    else if (sub === 'reject') {
      const channel = interaction.options.getChannel('channel_name')
      const messageId = interaction.options.getString('message_id')
      const reason =
        interaction.options.getString('reason') || 'No reason provided'
      response = await rejectSuggestion(
        interaction.member,
        channel,
        messageId,
        reason
      )
    } else {
      response = 'Not a valid subcommand!'
    }

    await interaction.followUp(response)
  },
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === 'ON' ? true : false
  settings.suggestions.enabled = enabled
  await settings.save()
  return `Suggestions system is now ${enabled ? 'enabled' : 'disabled'}!`
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null
    await settings.save()
    return 'Suggestions system is now disabled.'
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Oopsies! I need these permissions in ${channel} to work properly:\n${parsePermissions(CHANNEL_PERMS)}`
  }

  settings.suggestions.channel_id = channel.id
  await settings.save()
  return `Suggestions will now go to ${channel}! Yay! 🎉`
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null
    await settings.save()
    return 'Approved suggestions channel is now disabled.'
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Oopsies! I need these permissions in ${channel} to work properly:\n${parsePermissions(CHANNEL_PERMS)}`
  }

  settings.suggestions.approved_channel = channel.id
  await settings.save()
  return `Approved suggestions will now go to ${channel}! Woohoo!`
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null
    await settings.save()
    return 'Rejected suggestions channel is now disabled.'
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Oopsies! I need these permissions in ${channel} to work properly:\n${parsePermissions(CHANNEL_PERMS)}`
  }

  settings.suggestions.rejected_channel = channel.id
  await settings.save()
  return `Rejected suggestions will now go to ${channel}!`
}
