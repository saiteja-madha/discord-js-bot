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

    // Initialize database first
    if (client.config.DASHBOARD.enabled) {
      client.logger.log('Launching dashboard')
      try {
        const { launch } = require('@root/dashboard/app')
        await launch(client)
      } catch (ex) {
        client.logger.error('Failed to launch dashboard', ex)
        process.exit(1)
      }
    } else {
      await initializeMongoose()
    }

    // Now load commands after database is initialized
    await client.loadCommands('src/commands')
    client.loadContexts('src/contexts')
    client.loadEvents('src/events')

    // start the client
    await client.login(process.env.BOT_TOKEN)

    return client
  } catch (error) {
    console.error('Failed to initialize bot:', error)
    process.exit(1)
  }
}

// find unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err)
})

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
})

// Initialize the bot
initializeBot().catch(error => {
  console.error('Failed to start bot:', error)
  process.exit(1)
})
