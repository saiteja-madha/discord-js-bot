const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'logs',
  description: 'Configure moderation logs',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'channel',
        description: 'Set the logs channel',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'logs-channel',
            description: 'Select the channel to send mod logs',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: 'toggle',
        description: 'Toggle specific logging options',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: 'ghostping',
            description: 'Toggle anti-ghostping logging',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'msg-edit',
            description: 'Toggle logging for message edits',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'msg-del',
            description: 'Toggle logging for message deletions',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'mbr-role',
            description: 'Toggle logging for member role changes',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'chnl-create',
            description: 'Toggle logging for channel creation',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'chnl-edit',
            description: 'Toggle logging for channel edits',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'chnl-del',
            description: 'Toggle logging for channel deletions',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'role-create',
            description: 'Toggle logging for role creation',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'role-edit',
            description: 'Toggle logging for role edits',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
          {
            name: 'role-del',
            description: 'Toggle logging for role deletions',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'status',
                description: 'Enable or disable',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
              },
            ],
          },
        ],
      },
      {
        name: 'all',
        description: 'Enable or disable all logging',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'Enable or disable all logging',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const subCommand = interaction.options.getSubcommand()
    const subCommandGroup = interaction.options.getSubcommandGroup()

    if (subCommand === 'channel') {
      const targetChannel = interaction.options.getChannel('logs-channel')
      const response = await setChannel(targetChannel, data.settings)
      return interaction.followUp(response)
    }

    if (subCommandGroup === 'toggle') {
      const status = interaction.options.getBoolean('status')
      let response
      switch (subCommand) {
        case 'ghostping':
          response = await toggleSetting(
            data.settings,
            'automod.anti_ghostping',
            status
          )
          break
        case 'msg-edit':
          response = await toggleSetting(
            data.settings,
            'logs.member.message_edit',
            status
          )
          break
        case 'msg-del':
          response = await toggleSetting(
            data.settings,
            'logs.member.message_delete',
            status
          )
          break
        case 'mbr-role':
          response = await toggleSetting(
            data.settings,
            'logs.member.role_changes',
            status
          )
          break
        case 'chnl-create':
          response = await toggleSetting(
            data.settings,
            'logs.channel.create',
            status
          )
          break
        case 'chnl-edit':
          response = await toggleSetting(
            data.settings,
            'logs.channel.edit',
            status
          )
          break
        case 'chnl-del':
          response = await toggleSetting(
            data.settings,
            'logs.channel.delete',
            status
          )
          break
        case 'role-create':
          response = await toggleSetting(
            data.settings,
            'logs.role.create',
            status
          )
          break
        case 'role-edit':
          response = await toggleSetting(
            data.settings,
            'logs.role.edit',
            status
          )
          break
        case 'role-del':
          response = await toggleSetting(
            data.settings,
            'logs.role.delete',
            status
          )
          break
      }
      return interaction.followUp(response)
    }

    if (subCommand === 'all') {
      const status = interaction.options.getBoolean('status')
      const response = await toggleAllLogging(status, data.settings)
      return interaction.followUp(response)
    }
  },
}

async function setChannel(targetChannel, settings) {
  if (!targetChannel && !settings.logs_channel) {
    return 'Oh no! 😢 It seems like moderation logs are already disabled! 📭'
  }

  if (
    targetChannel &&
    !targetChannel
      .permissionsFor(targetChannel.guild.members.me)
      .has(['SendMessages', 'EmbedLinks'])
  ) {
    return "Ugh! 😫 I can't send logs to that channel! I need the `Send Messages` and `Embed Links` permissions there! 💬🔗"
  }

  settings.logs_channel = targetChannel?.id || null

  // Enable all logs when a channel is set
  if (targetChannel) {
    if (!settings.logs) settings.logs = {}
    settings.logs.enabled = true
    settings.logs.member = {
      message_edit: true,
      message_delete: true,
      role_changes: true,
    }
    settings.logs.channel = {
      create: true,
      edit: true,
      delete: true,
    }
    settings.logs.role = {
      create: true,
      edit: true,
      delete: true,
    }
    if (!settings.automod) settings.automod = {}
    settings.automod.anti_ghostping = true
  } else {
    // Disable all logs when channel is removed
    if (settings.logs) settings.logs.enabled = false
  }

  await settings.save()
  return `Yay! 🎉 Configuration saved! Logschannel ${targetChannel ? 'updated' : 'removed'} successfully! ${targetChannel ? 'All logs have been enabled.' : ''} 💖`
}

async function toggleSetting(settings, path, status) {
  let obj = settings
  const parts = path.split('.')
  const lastPart = parts.pop()
  for (const part of parts) {
    if (!obj[part]) obj[part] = {}
    obj = obj[part]
  }
  obj[lastPart] = status
  await settings.save()
  return `${path.split('.').pop().replace('_', ' ')} logging has been ${status ? 'enabled' : 'disabled'}! 🎭`
}

async function toggleAllLogging(status, settings) {
  settings.logs.enabled = status
  settings.logs.member.message_edit = status
  settings.logs.member.message_delete = status
  settings.logs.member.role_changes = status
  settings.logs.channel.create = status
  settings.logs.channel.edit = status
  settings.logs.channel.delete = status
  settings.logs.role.create = status
  settings.logs.role.edit = status
  settings.logs.role.delete = status
  settings.automod.anti_ghostping = status
  await settings.save()
  return `All logging has been ${status ? 'enabled' : 'disabled'}! 📝`
}
