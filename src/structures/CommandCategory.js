// src/structures/CommandCategory.js

const config = require('@src/config')

module.exports = {
  ADMIN: {
    name: 'Admin',
    image:
      'https://icons.iconarchive.com/icons/dakirby309/simply-styled/256/Settings-icon.png',
    emoji: '⚙️',
  },
  MODERATION: {
    name: 'Moderation',
    enabled: config.MODERATION.ENABLED,
    image:
      'https://icons.iconarchive.com/icons/lawyerwordpress/law/128/Gavel-Law-icon.png',
    emoji: '🔨',
  },
  AUTOMOD: {
    name: 'Automod',
    enabled: config.AUTOMOD.ENABLED,
    image:
      'https://icons.iconarchive.com/icons/dakirby309/simply-styled/256/Settings-icon.png',
    emoji: '🤖',
  },
  GIVEAWAY: {
    name: 'Giveaway',
    enabled: config.GIVEAWAYS.ENABLED,
    image: 'https://cdn-icons-png.flaticon.com/512/4470/4470928.png',
    emoji: '🎉',
  },
  TICKET: {
    name: 'Ticket',
    enabled: config.TICKET.ENABLED,
    image:
      'https://icons.iconarchive.com/icons/custom-icon-design/flatastic-2/512/ticket-icon.png',
    emoji: '🎫',
  },
  SUGGESTION: {
    name: 'Suggestion',
    enabled: config.SUGGESTIONS.ENABLED,
    image: 'https://cdn-icons-png.flaticon.com/512/1484/1484815.png',
    emoji: '📝',
  },

  ECONOMY: {
    name: 'Economy',
    enabled: config.ECONOMY.ENABLED,
    image:
      'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-11/128/coins-icon.png',
    emoji: '🪙',
  },
  MUSIC: {
    name: 'Music',
    enabled: config.MUSIC.ENABLED,
    image:
      'https://icons.iconarchive.com/icons/wwalczyszyn/iwindows/256/Music-Library-icon.png',
    emoji: '🎵',
  },
  IMAGE: {
    name: 'Image',
    enabled: config.IMAGE.ENABLED,
    image:
      'https://icons.iconarchive.com/icons/dapino/summer-holiday/128/photo-icon.png',
    emoji: '🖼️',
  },
  INVITE: {
    name: 'Invite',
    enabled: config.INVITE.ENABLED,
    image:
      'https://cdn4.iconfinder.com/data/icons/general-business/150/Invite-512.png',
    emoji: '📨',
  },
  INFO: {
    name: 'Information',
    image:
      'https://icons.iconarchive.com/icons/graphicloads/100-flat/128/information-icon.png',
    emoji: '🪧',
  },
  FUN: {
    name: 'Fun',
    image:
      'https://icons.iconarchive.com/icons/flameia/aqua-smiles/128/make-fun-icon.png',
    emoji: '😂',
  },
  ANIME: {
    name: 'Anime',
    image: 'https://wallpaperaccess.com/full/5680679.jpg',
    emoji: '🎨',
  },
  UTILITY: {
    name: 'Utility',
    image:
      'https://icons.iconarchive.com/icons/blackvariant/button-ui-system-folders-alt/128/Utilities-icon.png',
    emoji: '🛠',
  },
  DEV: {
    name: 'Developer',
    image:
      'https://www.pinclipart.com/picdir/middle/531-5318253_web-designing-icon-png-clipart.png',
    emoji: '🤴',
  },
}
