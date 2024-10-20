require('dotenv').config()
require('module-alias/register')

// register extenders
require('@helpers/extenders/Message')
require('@helpers/extenders/Guild')
require('@helpers/extenders/GuildChannel')

const { checkForUpdates } = require('@helpers/BotUtils')
const { initializeMongoose } = require('@src/database/mongoose')
const { BotClient } = require('@src/structures')
const { validateConfiguration } = require('@helpers/Validator')

validateConfiguration()

async function initializeBot() {
  try {
    // initialize client
    const client = new BotClient()

    // check for updates
    await checkForUpdates()

    // Initialize mongoose first
    await initializeMongoose()

    // Load commands and events
    await client.loadCommands('src/commands')
    client.loadContexts('src/contexts')
    client.loadEvents('src/events')

    // start the client
    await client.login(process.env.BOT_TOKEN)

    // Initialize dashboard last, after bot is ready
    if (client.config.DASHBOARD.enabled) {
      client.logger.log('Launching dashboard...')
      try {
        const { startServer } = await import('./dashboard/server.mjs')
        await startServer(client, client.config)
      } catch (ex) {
        client.logger.error('Failed to launch dashboard:', ex)
        // Don't exit process on dashboard failure
        client.logger.warn('Continuing bot operation without dashboard')
      }
    }

    return client
  } catch (error) {
    console.error('Failed to initialize bot:', error)
    process.exit(1)
  }
}

// Error handling
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err)
})

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
})

// Heroku specific handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Performing graceful shutdown...')
  // Implement any cleanup needed
  process.exit(0)
})

// Initialize the bot
initializeBot().catch(error => {
  console.error('Failed to start bot:', error)
  process.exit(1)
})
