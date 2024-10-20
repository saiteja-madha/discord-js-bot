import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import compressor from 'astro-compressor'
import starlight from '@astrojs/starlight'
import node from '@astrojs/node'

export default defineConfig({
  // Site configuration
  site: process.env.SITE_URL,

  // Server configuration for Heroku
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  // Directory configuration
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  base: '/',

  // Image configuration
  image: {
    domains: ['images.unsplash.com'],
  },

  prefetch: true,

  // Integrations
  integrations: [
    tailwind(),
    sitemap(),
    starlight({
      title: 'Bot Documentation',
      // ... rest of your starlight configuration
    }),
    compressor({
      gzip: true, // Enable gzip for Heroku
      brotli: true,
    }),
  ],

  // Vite configuration optimized for Heroku
  vite: {
    build: {
      cssMinify: true,
      minify: true,
      // Ensure builds complete within Heroku's timeout
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    // Optimize for Heroku's ephemeral filesystem
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
})
