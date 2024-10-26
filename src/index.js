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

    // check for updates
    await checkForUpdates()

    // Initialize mongoose first
    await initializeMongoose()

    // Load commands and events
    await client.loadCommands('./src/commands')
    client.loadContexts('./src/contexts')
    client.loadEvents('./src/events')

    // start the client
    await client.login(process.env.BOT_TOKEN)

    // Initialize dashboard last, after bot is ready
    if (client.config.DASHBOARD.enabled) {
      client.logger.log('Launching dashboard...')
      try {
        const app = express()
        const port = process.env.PORT || client.config.DASHBOARD.port || 8080

        // Parse cookies and add security middleware
        app.use(require('cookie-parser')())
        app.use(require('helmet')())

        // Serve static files from the Astro build output
        app.use(
          express.static(path.join(__dirname, '..', 'web', 'dist', 'client'))
        )

        // Handle dashboard routes (SSR)
        app.use('/web', async (req, res, next) => {
          if (
            req.url.startsWith('/web/_astro/') ||
            req.url.startsWith('/web/static/')
          ) {
            // Serve static assets directly
            return express.static(
              path.join(__dirname, '..', 'web', 'dist', 'client')
            )(req, res, next)
          }

          try {
            // Dynamically import the ESM handler
            const { handler } = await import('../web/dist/server/entry.mjs')
            const response = await handler(req, res)
            if (response.status === 404) {
              return res.sendFile(
                path.join(__dirname, '..', 'web', 'dist', 'client', '404.html')
              )
            }
          } catch (error) {
            console.error('SSR Error:', error)
            next(error)
          }
        })

        // For any other routes, serve the static build
        app.get('*', (req, res) => {
          res.sendFile(
            path.join(__dirname, '..', 'web', 'dist', 'client', 'index.html')
          )
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
