import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import compressor from 'astro-compressor'
import starlight from '@astrojs/starlight'

export default defineConfig({
  site: process.env.BASE_URL || 'http://localhost:8080',
  output: 'static',
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  base: '/',
  image: { domains: ['images.unsplash.com'] },
  integrations: [
    tailwind(),
    sitemap(),
    starlight({
      title: 'Bot Documentation',
      // Add any other Starlight configuration here
    }),
    compressor({ gzip: true, brotli: true }),
  ],
  vite: {
    build: {
      cssMinify: true,
      minify: true,
    },
    // Remove optimizeDeps section as it's causing warnings
  },
})

