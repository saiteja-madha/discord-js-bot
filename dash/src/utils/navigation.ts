// An array of links for navigation bar
const navBarLinks = [
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Docs', url: '/docs' },
  /* { name: 'Products', url: '/products' },
  { name: 'Services', url: '/services' },
  { name: 'Contact', url: '/contact' }, */
]
// An array of links for footer
const footerLinks = [
  {
    section: 'Ecosystem',
    links: [{ name: 'Documentation', url: '/docs' }],
  },
  {
    section: 'Company',
    links: [
      { name: 'Blog', url: '/blog' },
    ],
  },
]
// An object of links for social icons
const socialLinks = {
  discord: 'https://discord.com/oauth2/authorize?client_id=1035629678632915055',
  x: 'https://twitter.com/iamvikshan',
  github: 'https://github.com/vixshan/amina',
  youtube: 'https://youtube.com/@vikshan',
}

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
}



