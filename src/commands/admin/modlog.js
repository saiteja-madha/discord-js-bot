const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'modlog',
  description: 'Enable or disable moderation logs! 📝✨',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'channel',
        description: 'Select the channel to send mod logs! 📬',
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const channel = interaction.options.getChannel('channel')
    const response = await setChannel(channel, data.settings)
    return interaction.followUp(response)
  },
}

async function setChannel(targetChannel, settings) {
  if (!targetChannel && !settings.modlog_channel) {
    return 'Oh no! 😢 It seems like moderation logs are already disabled! 📭'
  }

  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return 'Ugh! 😫 I can’t send logs to that channel! I need the `Send Messages` and `Embed Links` permissions there! 💬🔗'
  }

  settings.modlog_channel = targetChannel?.id
  await settings.save()
  return `Yay! 🎉 Configuration saved! Modlog channel ${targetChannel ? 'updated' : 'removed'} successfully! 💖`
}
