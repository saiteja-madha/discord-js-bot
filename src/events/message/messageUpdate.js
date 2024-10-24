const { EmbedBuilder } = require('discord.js')
const { getSettings } = require('@schemas/Guild')
const { EMBED_COLORS } = require('@src/config')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} oldMessage
 * @param {import('discord.js').Message|import('discord.js').PartialMessage} newMessage
 */
module.exports = async (client, oldMessage, newMessage) => {
  // Ignore if message is partial
  if (oldMessage.partial) return

  // Ignore bot messages
  if (oldMessage.author.bot) return

  // Ignore messages not in a guild
  if (!oldMessage.guild) return

  const settings = await getSettings(oldMessage.guild)
  if (!settings.logs.enabled || !settings.logs_channel) return

  const logChannel = oldMessage.guild.channels.cache.get(settings.logs_channel)
  if (!logChannel) return

  // Ignore if the content hasn't changed
  if (oldMessage.content === newMessage.content) return

  // Check if message edit logging is enabled
  if (!settings.logs.member.message_edit) return

  const embed = new EmbedBuilder()
    .setTitle('Message Edited')
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`A message was edited in ${oldMessage.channel.toString()}`)
    .addFields(
      {
        name: 'Author',
        value: `${oldMessage.author.tag} (${oldMessage.author.id})`,
        inline: true,
      },
      { name: 'Channel', value: oldMessage.channel.toString(), inline: true },
      {
        name: 'Old Content',
        value:
          oldMessage.content.length > 1024
            ? oldMessage.content.slice(0, 1021) + '...'
            : oldMessage.content || 'None',
      },
      {
        name: 'New Content',
        value:
          newMessage.content.length > 1024
            ? newMessage.content.slice(0, 1021) + '...'
            : newMessage.content || 'None',
      }
    )
    .setTimestamp()

  logChannel.safeSend({ embeds: [embed] })
}
