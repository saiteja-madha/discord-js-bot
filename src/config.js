module.exports = {
  INTERACTIONS: {
    SLASH: 'true', // Should the interactions be enabled
    CONTEXT: 'true', // Should contexts be enabled
    GLOBAL:
      process.env.GLOBAL !== undefined ? process.env.GLOBAL === 'true' : true, // Should the interactions be registered globally
  },

  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR:
      'Oopsie! 🌟 Something went wrong on our end. Please try again later or reach out to our support server! 💖',
  },

  // whether or not to enable feedback/report system
  FEEDBACK: {
    ENABLED: true,
    URL: process.env.LOGS_WEBHOOK,
  },

  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: '#F1F1F1', // Light gray for a neutral tone
    DM_EMBED: '#FFB3D9', // Soft pastel pink for DM embeds
  },

  DASHBOARD: {
    enabled:
      process.env.DASH !== undefined ? process.env.DASH === 'true' : true,
    port: process.env.PORT || '8080', // Port to run the dashboard on
  },

  ECONOMY: {
    ENABLED: true,
    CURRENCY: '₪',
    DAILY_COINS: 100, // coins to be received by daily command
    MIN_BEG_AMOUNT: 100, // minimum coins to be received when beg command is used
    MAX_BEG_AMOUNT: 2500, // maximum coins to be received when beg command is used
  },

  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 60, // Time in seconds before the bot disconnects from an idle voice channel
    DEFAULT_VOLUME: 60, // Default player volume 1-100
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: 'SC', // Default source for music
    LAVALINK_NODES: [
      {
        id: process.env.LAVALINK_ID,
        host: process.env.LAVALINK_HOST,
        port: process.env.LAVALINK_PORT,
        password: process.env.LAVALINK_PASSWORD,
        secure: process.env.LAVALINK_SECURE === 'true',
        retryAmount: 20, // Number of reconnection attempts
        retryDelay: 30000, // Delay (in ms) between reconnection attempts
      },
    ],
  },

  GIVEAWAYS: {
    ENABLED: true,
    REACTION: '🎁',
    START_EMBED: '#FFB3D9', // Soft pastel pink for giveaway embeds
    END_EMBED: '#FFB3D9',
  },

  IMAGE: {
    ENABLED: true,
    BASE_API: 'https://strangeapi.hostz.me/api',
  },

  INVITE: {
    ENABLED: true,
  },
  EMBED_COLORS: {
    BOT_EMBED: '#FF1493', // (Deep pink - represents her core energy and vibrant spirit)
    SUCCESS: '#00FFB3', // (Bright aqua - her creative, unique way of seeing success)
    ERROR: '#FF6978', // (Coral pink - softer than traditional red, showing her sensitivity even in errors)
    WARNING: '#FFD93D', // (Bright yellow - her playful way of warning others)
  },
  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: '#9B6DFF', // (Soft purple - gentle but firm)
      UNTIMEOUT: '#4DEEEA', // (Bright turquoise - freedom and relief)
      KICK: '#FF9A8C', // (Salmon pink - serious but not harsh)
      SOFTBAN: '#FF75C3', // (Medium pink - firm but temporary)
      BAN: '#FF3864', // (Strong pink-red - serious but still on-brand)
      UNBAN: '#00F5D4', // (Mint green - fresh starts)
      VMUTE: '#D4B3FF', // (Lavender - gentle silence)
      VUNMUTE: '#98FB98', // (Pale green - gentle freedom)
      DEAFEN: '#C8A2C8', // (Lilac - peaceful quiet)
      UNDEAFEN: '#7FFFD4', // (Aquamarine - return to sound)
      DISCONNECT: 'RANDOM', // (Keeps her chaotic energy)
      MOVE: 'RANDOM', // (Keeps her spontaneity)
    },
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5,
    DEFAULT_LVL_UP_MSG:
      '{member:tag}, Yay! 🎉 You just leveled up to **Level {level}**! 🌟',
  },

  SUGGESTIONS: {
    ENABLED: true,
    EMOJI: {
      UP_VOTE: '⬆️',
      DOWN_VOTE: '⬇️',
    },
    DEFAULT_EMBED: '#FFB8DE', // (Light pink - welcoming new ideas)
    APPROVED_EMBED: '#47E0A0', // (Seafoam green - creative acceptance)
    DENIED_EMBED: '#FF8BA7', // (Soft rose - gentle rejection)
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: '#E0AAFF', // (Soft violet - welcoming support)
    CLOSE_EMBED: '#48D1CC', // (Turquoise - positive closure)
  },
}
