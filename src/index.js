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
const express = require('express')
const path = require('path')

validateConfiguration()

async function initializeBot() {
  try {
    // initialize client
    const client = new BotClient()
    await checkForUpdates()
    await initializeMongoose()
    await client.loadCommands('./src/commands')
    client.loadContexts('./src/contexts')
    client.loadEvents('./src/events')
    await client.login(process.env.BOT_TOKEN)

    // Initialize dashboard
    if (client.config.DASHBOARD.enabled) {
      client.logger.log('Launching dashboard...')
      try {
        const app = express()
        const port = process.env.PORT || client.config.DASHBOARD.port || 8080

        // Basic middleware
        app.use(require('cookie-parser')())
        app.use(
          require('helmet')({
            contentSecurityPolicy: false,
          })
        )

        // Import the Astro middleware handler
        const { handler } = await import('../astro/dist/server/entry.mjs')

        // Serve static files
        app.use(
          express.static(
            path.join(__dirname, '..', 'astro', 'dist', 'client'),
            {
              index: false, // Prevent express from serving index.html directly
            }
          )
        )

        // Use Astro's middleware handler for all routes
        app.use(handler)

        // Error handling middleware
        app.use((err, req, res, next) => {
          console.error('Server error:', err)
          res.status(500).send('Internal Server Error')
        })

        app.listen(port, () => {
          const baseURL = process.env.BASE_URL || `http://localhost:${port}`
          client.logger.success(`Dashboard is running on port ${port}`)
          client.logger.log(`Dashboard URL: ${baseURL}`)
        })
      } catch (ex) {
        client.logger.error('Failed to launch dashboard:', ex)
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

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Performing graceful shutdown...')
  process.exit(0)
})

initializeBot().catch(error => {
  console.error('Failed to start bot:', error)
  process.exit(1)
})
