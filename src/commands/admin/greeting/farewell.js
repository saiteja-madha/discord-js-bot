const { buildGreeting } = require('@handlers/greeting')
const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'farewell',
  description: 'Set up a farewell message for your server!',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'status',
        description: 'Enable or disable the farewell message',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'Choose ON or OFF',
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
        description: 'Preview the configured farewell message! 🌟',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'channel',
        description: 'Set the channel for farewell messages 📬',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'Select a channel',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: 'desc',
        description: 'Set the embed description for the farewell message ✨',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'content',
            description: 'What would you like the description to say?',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'thumbnail',
        description: 'Configure the embed thumbnail 🌸',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'Thumbnail status (ON/OFF)',
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
        description: 'Set the embed color for your farewell message 🎨',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'hex-code',
            description: 'Enter the hex color code (e.g., #FF5733)',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'footer',
        description: 'Set the footer for the farewell embed 👣',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'content',
            description: 'What should the footer say?',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'image',
        description: 'Set an image for the farewell embed 🖼️',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'url',
            description: 'Enter the image URL',
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
        response = "Oopsie! That's an invalid subcommand. Please try again! 🥺"
    }

    return interaction.followUp(response)
  },
}

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled)
    return 'Oh no! The farewell message is not enabled in this server. 💔'

  const targetChannel = member.guild.channels.cache.get(
    settings.farewell.channel
  )
  if (!targetChannel)
    return 'Hmm... No channel is configured to send the farewell message. 😢'

  const response = await buildGreeting(member, 'FAREWELL', settings.farewell)
  await targetChannel.safeSend(response)

  return `✨ Sent a preview of the farewell message to ${targetChannel.toString()}!`
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === 'ON' ? true : false
  settings.farewell.enabled = enabled
  await settings.save()
  return `🎉 Configuration saved! Farewell message has been ${status === 'ON' ? 'enabled' : 'disabled'}.`
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return `Oh no! I can't send farewells to that channel. I need the \`Write Messages\` and \`Embed Links\` permissions in ${channel.toString()}! 💦`
  }
  settings.farewell.channel = channel.id
  await settings.save()
  return `📢 Configuration saved! Farewell messages will now be sent to ${channel.toString()}!`
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc
  await settings.save()
  return '💖 Configuration saved! The farewell message description has been updated. 🌈'
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === 'ON'
  await settings.save()
  return '🌸 Configuration saved! The thumbnail for the farewell message has been updated. 🎀'
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color
  await settings.save()
  return '🎨 Configuration saved! The color for the farewell message has been updated. 🌟'
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content
  await settings.save()
  return '📝 Configuration saved! The footer for the farewell message has been updated. ✨'
}

async function setImage(settings, url) {
  settings.farewell.embed.image = url
  await settings.save()
  return '🖼️ Configuration saved! The image for the farewell message has been updated. 🎉'
}
