const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
} = require('discord.js')
const { EMBED_COLORS, AUTOMOD } = require('@root/config.js')
const { stripIndent } = require('common-tags')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'automod',
  description: 'Various automod configuration!',
  category: 'AUTOMOD',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: AUTOMOD.ENABLED,
    ephemeral: true,
    options: [
      {
        name: 'status',
        description: '🔍 Check automod configuration',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'strikes',
        description: '⚠️ Set maximum number of strikes before taking an action',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'amount',
            description: '💖 Number of strikes (default 5)',
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
      {
        name: 'action',
        description:
          '⚔️ Set action to be performed after receiving maximum strikes',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'action',
            description: '💔 Action to perform',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: 'TIMEOUT',
                value: 'TIMEOUT',
              },
              {
                name: 'KICK',
                value: 'KICK',
              },
              {
                name: 'BAN',
                value: 'BAN',
              },
            ],
          },
        ],
      },
      {
        name: 'debug',
        description:
          '🛠️ Enable/disable automod for messages sent by admins & moderators',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: '🌈 Configuration status',
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
        name: 'whitelist',
        description: '🔒 View whitelisted channels',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'whitelistadd',
        description: '✨ Add a channel to the whitelist',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: '🌸 Channel to add',
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: 'whitelistremove',
        description: '❌ Remove a channel from the whitelist',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: '💔 Channel to remove',
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    const settings = data.settings

    let response

    if (sub === 'status')
      response = await getStatus(settings, interaction.guild)
    else if (sub === 'strikes')
      response = await setStrikes(
        settings,
        interaction.options.getInteger('amount')
      )
    else if (sub === 'action')
      response = await setAction(
        settings,
        interaction.guild,
        interaction.options.getString('action')
      )
    else if (sub === 'debug')
      response = await setDebug(
        settings,
        interaction.options.getString('status')
      )
    else if (sub === 'whitelist') {
      response = getWhitelist(interaction.guild, settings)
    } else if (sub === 'whitelistadd') {
      const channelId = interaction.options.getChannel('channel').id
      response = await whiteListAdd(settings, channelId)
    } else if (sub === 'whitelistremove') {
      const channelId = interaction.options.getChannel('channel').id
      response = await whiteListRemove(settings, channelId)
    }

    await interaction.followUp(response)
  },
}

async function getStatus(settings, guild) {
  const { automod } = settings

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : 'Not Configured 💔'

  // String Builder
  let desc = stripIndent`
    ❯ **Max Lines**: ${automod.max_lines || 'NA'}
    ❯ **Anti-Massmention**: ${automod.anti_massmention > 0 ? '✓' : '✕'}
    ❯ **Anti-Attachment**: ${automod.anti_attachment ? '✓' : '✕'}
    ❯ **Anti-Links**: ${automod.anti_links ? '✓' : '✕'}
    ❯ **Anti-Invites**: ${automod.anti_invites ? '✓' : '✕'}
    ❯ **Anti-Spam**: ${automod.anti_spam ? '✓' : '✕'}
    ❯ **Anti-Ghostping**: ${automod.anti_ghostping ? '✓' : '✕'}
  `

  const embed = new EmbedBuilder()
    .setAuthor({
      name: '✨ Automod Configuration ✨',
      iconURL: guild.iconURL(),
    })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: '🔍 Log Channel',
        value: logChannel,
        inline: true,
      },
      {
        name: '⚠️ Max Strikes',
        value: automod.strikes.toString(),
        inline: true,
      },
      {
        name: '💔 Action',
        value: automod.action,
        inline: true,
      },
      {
        name: '🔧 Debug',
        value: automod.debug ? '✓' : '✕',
        inline: true,
      }
    )

  return { embeds: [embed] }
}

async function setStrikes(settings, strikes) {
  settings.automod.strikes = strikes
  await settings.save()
  return `🎉 Configuration saved! Maximum strikes is set to **${strikes}**!`
}

async function setAction(settings, guild, action) {
  if (action === 'TIMEOUT') {
    if (!guild.members.me.permissions.has('ModerateMembers')) {
      return '💔 Oops! I need permission to timeout members!'
    }
  }

  if (action === 'KICK') {
    if (!guild.members.me.permissions.has('KickMembers')) {
      return '💔 Oops! I need permission to kick members!'
    }
  }

  if (action === 'BAN') {
    if (!guild.members.me.permissions.has('BanMembers')) {
      return '💔 Oops! I need permission to ban members!'
    }
  }

  settings.automod.action = action
  await settings.save()
  return `🎉 Configuration saved! Automod action is set to **${action}**!`
}

async function setDebug(settings, input) {
  const status = input.toLowerCase() === 'on' ? true : false
  settings.automod.debug = status
  await settings.save()
  return `🎉 Configuration saved! Automod debug is now **${status ? 'enabled' : 'disabled'}**!`
}

function getWhitelist(guild, settings) {
  const whitelist = settings.automod.wh_channels
  if (!whitelist || !whitelist.length) return '🔒 No channels are whitelisted~'

  const channels = []
  for (const channelId of whitelist) {
    const channel = guild.channels.cache.get(channelId)
    if (!channel) continue
    if (channel) channels.push(channel.toString())
  }

  return `✨ Whitelisted channels: ${channels.join(', ')}`
}

async function whiteListAdd(settings, channelId) {
  if (settings.automod.wh_channels.includes(channelId))
    return '❌ Channel is already whitelisted~'
  settings.automod.wh_channels.push(channelId)
  await settings.save()
  return `✨ Channel whitelisted!`
}

async function whiteListRemove(settings, channelId) {
  if (!settings.automod.wh_channels.includes(channelId))
    return '❌ Channel is not whitelisted~'
  settings.automod.wh_channels.splice(
    settings.automod.wh_channels.indexOf(channelId),
    1
  )
  await settings.save()
  return `❌ Channel removed from whitelist!`
}
