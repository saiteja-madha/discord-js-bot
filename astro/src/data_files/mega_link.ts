// Define data structures for features and community highlights
export const servicesData = [
  {
    title: 'Command Guide',
    description:
      "Explore Amina's current commands and features! She's always excited to show you what she can do.",
    icon: 'wand',
    url: '/docs',
  },
  {
    title: 'Development Updates',
    description:
      "Keep up with Amina's latest adventures! See what new features are being added.",
    icon: 'sparkles',
    url: '/blog',
  },
  {
    title: 'Join Development',
    description: 'Help shape Amina! Contributors of all skills are welcome.',
    icon: 'code',
    url: 'https://github.com/vixshan/mina',
  },
  {
    title: 'Fun Features',
    description:
      'From creative tools to mini-games, discover all the ways Amina brings joy to your server!',
    icon: 'gamepad',
    url: '/docs',
  },
  {
    title: 'Getting Started',
    description:
      'New to Amina? Learn how to invite her to your server and start the adventure!',
    icon: 'rocket',
    url: '/docs',
  },
  {
    title: 'Community Hub',
    description: 'Join our Discord server to meet other Amina enthusiasts!',
    icon: 'heart',
    url: '${process.env.SUPPORT_SERVER}',
  },
];

export const successStoriesData = [
  {
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80',
    alt: 'Amina Community Highlight',
    description:
      "Check out the amazing ways our community is helping shape Amina's development! From feature suggestions to code contributions, every member makes a difference.",
    learnMoreUrl: '${process.env.SUPPORT_SERVER}',
  },
];
