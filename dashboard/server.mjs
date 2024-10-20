import { fileURLToPath } from 'url'
import path from 'path'
import http from 'http'
import express from 'express'
import { build } from 'astro'
// Use dynamic import for compression since it's CommonJS
const compressionPromise = import('compression').then(module => module.default)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function buildAstroApp() {
  try {
    await build({
      root: path.resolve(__dirname),
      outDir: path.resolve(__dirname, 'dist'),
      output: 'server',
      server: {
        host: '0.0.0.0',
      },
    })
  } catch (err) {
    throw new Error(`Failed to build Astro app: ${err.message}`)
  }
}

let handler
async function getHandler() {
  if (!handler) {
    try {
      const module = await import('./dist/server/entry.mjs')
      handler = module.handler
    } catch (err) {
      throw new Error(
        'Failed to import server handler. Make sure the dashboard is built: ' +
          err.message
      )
    }
  }
  return handler
}

async function createServer() {
  // Build the Astro app if we're not in development mode
  if (process.env.NODE_ENV !== 'development') {
    await buildAstroApp()
  }

  const app = express()

  // Enable compression
  const compression = await compressionPromise
  app.use(compression())

  // Trust Heroku proxy
  app.set('trust proxy', true)

  // Security headers
  app.use((req, res, next) => {
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
    })
    next()
  })

  // Force HTTPS in production (Heroku)
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`)
      } else {
        next()
      }
    })
  }

  // Serve static files with caching headers
  app.use(
    express.static(path.join(__dirname, 'dist', 'client'), {
      maxAge: '1d',
      etag: true,
    })
  )

  // Get the handler and use it
  const ssrHandler = await getHandler()
  app.use(ssrHandler)

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  return app
}

export async function startServer(client, config) {
  try {
    const app = await createServer()
    const server = http.createServer(app)

    // Use Heroku's PORT environment variable
    const port = process.env.PORT || config.DASHBOARD.port || 8080

    server.listen(port, '0.0.0.0', () => {
      client.logger.success(`Dashboard is running on port ${port}`)
      client.logger.log(
        `Dashboard URL: ${process.env.SITE_URL || config.DASHBOARD.baseURL}`
      )
    })

    // Handle server errors
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        client.logger.error(`Port ${port} is already in use`)
      } else {
        client.logger.error('Dashboard server error:', err)
      }
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      server.close(() => {
        client.logger.log('Dashboard server closed')
        process.exit(0)
      })
    })

    return server
  } catch (err) {
    client.logger.error('Failed to start dashboard:', err)
    throw err
  }
}
