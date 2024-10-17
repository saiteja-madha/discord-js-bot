const { automodHandler, statsHandler } = require('@src/handlers')
const { getSettings } = require('@schemas/Guild')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return
  const settings = await getSettings(message.guild)

  // check for bot mentions
  if (message.content.includes(`${client.user.id}`)) {
    message.channel.safeSend(
      `I no longer use slash commands. Use \`/help\` instead.`
    )
  }
  // command handler

  let isCommand = false

  // stats handler
  if (settings.stats.enabled)
    await statsHandler.trackMessageStats(message, isCommand, settings)

  // if not a command
  if (!isCommand) await automodHandler.performAutomod(message, settings)
}
