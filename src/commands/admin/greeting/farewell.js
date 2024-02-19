const { isHex } = require('@helpers/Utils')
const { buildGreeting } = require('@handlers/greeting')
const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'farewell',
  description: 'setup farewell message',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'status',
        description: 'enable or disable farewell message',
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
        name: 'preview',
        description: 'preview the configured farewell message',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'channel',
        description: 'set farewell channel',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'channel name',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: 'desc',
        description: 'set embed description',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'content',
            description: 'description content',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'thumbnail',
        description: 'configure embed thumbnail',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'thumbnail status',
            type: ApplicationCommandOptionType.String,
            required: true,
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
        name: 'color',
        description: 'set embed color',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'hex-code',
            description: 'hex color code',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'footer',
        description: 'set embed footer',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'content',
            description: 'footer content',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'image',
        description: 'set embed image',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'url',
            description: 'image url',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    const settings = data.settings

    let response
    switch (sub) {
      case 'preview':
        response = await sendPreview(settings, interaction.member)
        break

      case 'status':
        response = await setStatus(
          settings,
          interaction.options.getString('status')
        )
        break

      case 'channel':
        response = await setChannel(
          settings,
          interaction.options.getChannel('channel')
        )
        break

      case 'desc':
        response = await setDescription(
          settings,
          interaction.options.getString('content')
        )
        break

      case 'thumbnail':
        response = await setThumbnail(
          settings,
          interaction.options.getString('status')
        )
        break

      case 'color':
        response = await setColor(
          settings,
          interaction.options.getString('hex-code')
        )
        break

      case 'footer':
        response = await setFooter(
          settings,
          interaction.options.getString('content')
        )
        break

      case 'image':
        response = await setImage(
          settings,
          interaction.options.getString('url')
        )
        break

      default:
        response = 'Invalid subcommand'
    }

    return interaction.followUp(response)
  },
}

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled)
    return 'Farewell message not enabled in this server'

  const targetChannel = member.guild.channels.cache.get(
    settings.farewell.channel
  )
  if (!targetChannel) return 'No channel is configured to send farewell message'

  const response = await buildGreeting(member, 'FAREWELL', settings.farewell)
  await targetChannel.safeSend(response)

  return `Sent farewell preview to ${targetChannel.toString()}`
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === 'ON' ? true : false
  settings.farewell.enabled = enabled
  await settings.save()
  return `Configuration saved! Farewell message ${status ? 'enabled' : 'disabled'}`
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      'Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in ' +
      channel.toString()
    )
  }
  settings.farewell.channel = channel.id
  await settings.save()
  return `Configuration saved! Farewell message will be sent to ${channel ? channel.toString() : 'Not found'}`
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc
  await settings.save()
  return 'Configuration saved! Farewell message updated'
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail =
    status.toUpperCase() === 'ON' ? true : false
  await settings.save()
  return 'Configuration saved! Farewell message updated'
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color
  await settings.save()
  return 'Configuration saved! Farewell message updated'
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content
  await settings.save()
  return 'Configuration saved! Farewell message updated'
}

async function setImage(settings, url) {
  settings.farewell.embed.image = url
  await settings.save()
  return 'Configuration saved! Farewell message updated'
}
