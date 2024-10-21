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
        discord: 'https://discord.com/oauth2/authorize?client_id=1035629678632915055',
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
  },
})



