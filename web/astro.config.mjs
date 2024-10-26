// @root/web/astro.config.mjs

import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import compressor from 'astro-compressor'
import starlight from '@astrojs/starlight'
import node from '@astrojs/node'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  site: process.env.BASE_URL || 'http://localhost:8080',
  output: 'hybrid',
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  base: '/',
  adapter: node({
    mode: 'standalone',
  }),
  image: { domains: ['images.unsplash.com'] },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    tailwind(),
    sitemap(),
    starlight({
      title: 'Amina Docs',
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
      sidebar: [
        {
          label: 'Quick Start Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Commands',
          items: [
            { label: 'My Commands', link: 'commands/commands' },
            {
              label: 'Admin & Mod',
              autogenerate: { directory: 'commands/admin' },
            },
            { label: 'Fun', autogenerate: { directory: 'commands/fun' } },
            {
              label: 'Utility',
              autogenerate: { directory: 'commands/utility' },
            },
            { label: 'Developer', link: 'commands/dev/dev' },
          ],
        },
        {
          label: 'Self Hosting',
          items: [
            { label: 'Introduction', link: 'selfhost/start' },
            {
              label: 'Installation',
              autogenerate: { directory: 'selfhost/installation' },
            },
            {
              label: 'Dashboard',
              autogenerate: { directory: 'selfhost/dashboard' },
            },
          ],
        },
        {
          label: 'Extras',
          autogenerate: { directory: 'extras' },
        },
      ],
      social: {
        github: 'https://github.com/mearashadowfax/ScrewFast',
        discord:
          'https://discord.com/oauth2/authorize?client_id=1035629678632915055',
      },
      disable404Route: true,
      customCss: ['./src/assets/styles/starlight.css'],
      favicon: '/favicon.ico',
      components: {
        SiteTitle: './src/components/ui/starlight/SiteTitle.astro',
        Head: './src/components/ui/starlight/Head.astro',
        MobileMenuFooter:
          './src/components/ui/starlight/MobileMenuFooter.astro',
        ThemeSelect: './src/components/ui/starlight/ThemeSelect.astro',
      },
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://screwfast.uk' + '/social.webp',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'twitter:image',
            content: 'https://screwfast.uk' + '/social.webp',
          },
        },
      ],
    }),
    compressor({ gzip: true, brotli: true }),
  ],
  vite: {
    build: {
      cssMinify: true,
      minify: true,
    },
    envDir: path.resolve(__dirname, '..'), // Point to root directory
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@content': path.resolve(__dirname, './src/content'),
        '@data': path.resolve(__dirname, './src/data_files'),
        '@images': path.resolve(__dirname, './src/images'),
        '@scripts': path.resolve(__dirname, './src/assets/scripts'),
        '@styles': path.resolve(__dirname, './src/assets/styles'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@root': path.resolve(__dirname, '..'),
        '@docs': path.resolve(__dirname, './src/content/docs'),
      },
    },
  },
})
