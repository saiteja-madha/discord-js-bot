import ogImageSrc from '@images/social.png';

export const SITE = {
  title: 'Amina',
  tagline: 'Your Creative & Energetic Discord Companion!',
  description:
    'Meet Amina, a vibrant Discord bot bringing creativity, fun, and a dash of chaos to your server! Currently in development, Amina offers unique features wrapped in a playful personality. Join us in shaping her future!',
  description_short:
    'A quirky, artistic Discord bot that brings life to your server with creative features and infectious enthusiasm.',
  url: 'https://amina.vikshan.tech',
  author: 'Vikshan',
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    inLanguage: 'en-US',
    '@id': SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      '@type': 'WebSite',
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: 'en_US',
  type: 'website',
  url: SITE.url,
  title: `${SITE.title}: Your Creative Discord Companion`,
  description:
    "Introducing Amina, a uniquely personable Discord bot with a flair for creativity and fun! Currently in development, she's looking for fellow creators and developers to help shape her features and personality. Join our community and be part of something special!",
  image: ogImageSrc,
};
