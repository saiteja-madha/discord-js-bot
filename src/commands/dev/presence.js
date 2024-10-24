const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ActivityType,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config')
const { getPresenceConfig, updatePresenceConfig } = require('@schemas/Dev')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'presence',
  description: 'Update bot presence configuration',
  category: 'DEV',
  botPermissions: ['EmbedLinks'],
  testGuildOnly: true,
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'enabled',
        description: 'Enable/disable presence updates',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
      {
        name: 'status',
        description: 'Set bot status',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: 'Online', value: 'online' },
          { name: 'Idle', value: 'idle' },
          { name: 'Do Not Disturb', value: 'dnd' },
          { name: 'Invisible', value: 'invisible' },
        ],
      },
      {
        name: 'type',
        description: 'Set activity type',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: 'Competing', value: 'COMPETING' },
          { name: 'Listening', value: 'LISTENING' },
          { name: 'Playing', value: 'PLAYING' },
          { name: 'Watching', value: 'WATCHING' },
          { name: 'Streaming', value: 'STREAMING' },
          { name: 'Custom', value: 'CUSTOM' },
        ],
      },
      {
        name: 'message',
        description: 'Set status message',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: 'url',
        description: 'Set streaming URL (only for streaming type)',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const enabled = interaction.options.getBoolean('enabled')
    const status = interaction.options.getString('status')
    const type = interaction.options.getString('type')
    const message = interaction.options.getString('message')
    const url = interaction.options.getString('url')

    const currentConfig = await getPresenceConfig()
    const update = {
      PRESENCE: {
        ...currentConfig.PRESENCE,
        ...(enabled !== null && { ENABLED: enabled }),
        ...(status && { STATUS: status }),
        ...(type && { TYPE: type }),
        ...(message && { MESSAGE: message }),
        ...(url && { URL: url }),
      },
    }

    await updatePresenceConfig(update)

    // Update the bot's presence immediately
    if (update.PRESENCE.ENABLED) {
      const presence = {
        status: update.PRESENCE.STATUS,
        activities: [
          {
            name: update.PRESENCE.MESSAGE.replace(
              '{servers}',
              interaction.client.guilds.cache.size
            ).replace('{members}', interaction.client.users.cache.size),
            type: ActivityType[update.PRESENCE.TYPE],
            ...(update.PRESENCE.TYPE === 'STREAMING' && {
              url: update.PRESENCE.URL,
            }),
          },
        ],
      }

      await interaction.client.user.setPresence(presence)
    } else {
      await interaction.client.user.setPresence({
        status: 'invisible',
        activities: [],
      })
    }

    const embed = new EmbedBuilder()
      .setDescription('✅ Bot presence configuration updated')
      .setColor(EMBED_COLORS.SUCCESS)
      .addFields([
        {
          name: 'Enabled',
          value: update.PRESENCE.ENABLED.toString(),
          inline: true,
        },
        { name: 'Status', value: update.PRESENCE.STATUS, inline: true },
        { name: 'Type', value: update.PRESENCE.TYPE, inline: true },
        { name: 'Message', value: update.PRESENCE.MESSAGE },
        { name: 'URL', value: update.PRESENCE.URL || 'N/A' },
      ])

    return interaction.followUp({ embeds: [embed] })
  },
}
