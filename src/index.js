// @root/src/index.js
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
const fs = require('fs')
const { createServer } = require('http')
const { fileURLToPath } = require('url')

validateConfiguration()

async function initializeBot() {
  let client
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
        app.use(
          require('helmet')({
            contentSecurityPolicy: false,
          })
        )

        // Body parsing middleware
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))

        // Verify Astro build output paths
        const astroClientDir = path.join(
          __dirname,
          '..',
          'astro',
          'dist',
          'client'
        )
        const astroServerDir = path.join(
          __dirname,
          '..',
          'astro',
          'dist',
          'server'
        )

        // Log paths for debugging
        client.logger.log('Astro Client Dir:', astroClientDir)
        client.logger.log('Astro Server Dir:', astroServerDir)

        // Check if directories exist
        if (!fs.existsSync(astroClientDir)) {
          throw new Error(`Astro client directory not found: ${astroClientDir}`)
        }
        if (!fs.existsSync(astroServerDir)) {
          throw new Error(`Astro server directory not found: ${astroServerDir}`)
        }

        // Serve static files from Astro client directory
        app.use(
          express.static(astroClientDir, {
            maxAge: '1d',
            etag: true,
            setHeaders: (res, filePath) => {
              if (path.extname(filePath).toLowerCase() === '.html') {
                res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
              }
            },
          })
        )

        // Dynamically import Astro SSR handler
        const entryPath = path.join(astroServerDir, 'entry.mjs')
        const entryUrl = `file://${entryPath}`

        const { handler } = await import(entryUrl)

        // Create middleware function for Astro SSR
        const handleSSR = async (req, res, next) => {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`)

            const response = await handler({
              request: new Request(url, {
                method: req.method,
                headers: req.headers,
                body:
                  req.method !== 'GET' && req.method !== 'HEAD'
                    ? JSON.stringify(req.body)
                    : undefined,
              }),
            })

            // Set response status
            res.status(response.status)

            // Set response headers
            for (const [key, value] of response.headers.entries()) {
              res.set(key, value)
            }

            // Send response body
            const body = await response.text()
            res.send(body)
          } catch (error) {
            client.logger.error('SSR Handler Error:', error)
            next(error)
          }
        }

        // Use SSR handler for all routes not handled by static files
        app.use(handleSSR)

        // Error handling middleware
        app.use((err, req, res, next) => {
          client.logger.error('Express Error:', err)
          res.status(500).send('Internal Server Error')
        })

        // Create HTTP server
        const server = createServer(app)

        // Start server
        server.listen(port, () => {
          const baseURL = process.env.BASE_URL || `http://localhost:${port}`
          client.logger.success(`Dashboard is running on port ${port}`)
          client.logger.log(`Dashboard URL: ${baseURL}`)
        })

        // Graceful shutdown
        process.on('SIGTERM', () => {
          client.logger.log('SIGTERM received. Shutting down server...')
          server.close(() => {
            client.logger.log('Server closed.')
            process.exit(0)
          })
        })

        return server
      } catch (ex) {
        client.logger.error('Failed to launch dashboard:', ex)
        client.logger.warn('Continuing bot operation without dashboard')
      }
    }

    return client
  } catch (error) {
    if (client) {
      client.logger.error('Failed to initialize bot:', error)
    } else {
      console.error('Failed to initialize bot:', error)
    }
    process.exit(1)
  }
}

// Global error handling
process.on('unhandledRejection', err => {
  if (client) {
    client.logger.error('Unhandled Rejection:', err)
  } else {
    console.error('Unhandled Rejection:', err)
  }
})

process.on('uncaughtException', err => {
  if (client) {
    client.logger.error('Uncaught Exception:', err)
  } else {
    console.error('Uncaught Exception:', err)
  }
})

// Initialize the bot
initializeBot().catch(error => {
  console.error('Failed to start bot:', error)
  process.exit(1)
})
