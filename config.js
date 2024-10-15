module.exports = {
  DEV_IDS: process.env.DEV_ID || ['929835843479302204'], // Bot owner ID's
  SUPPORT_SERVER: process.env.SUPPORT_SERVER || 'https://discord.gg/uMgS9evnmv', // Your bot support server
  DOCS_URL: process.env.DOCS_URL || 'https://docs.vikshan.tech/mochi/', // Your bot documentation website
  DONATE_URL: process.env.DONATE_URL || 'https://ko-fi.com/vikshan', // Your donation link
  GITHUB_SPONSORS_URL:
    process.env.GITHUB_SPONSORS_URL || 'https://github.com/sponsors/vixshan', // Your bot github sponsors link
  PATREON_URL: process.env.PATREON_URL || 'https://www.patreon.com/vikshan', // Your bot patreon link
  BOTS_URL: process.env.BOTS_URL || 'https://go.vikshan.tech/bots', // Other bot's Invite Link

  INTERACTIONS: {
    SLASH: 'true', // Should the interactions be enabled
    CONTEXT: 'true', // Should contexts be enabled
    GLOBAL: 'true', // Should the interactions be registered globally
    TEST_GUILD_ID: process.env.TEST_GUILD_ID || '1072214895598248030', // Guild ID where the interactions should be registered. [** Test you commands here first **]
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

  // PLUGINS

  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: '#F1F1F1', // Light gray for a neutral tone
    DM_EMBED: '#FFB3D9', // Soft pastel pink for DM embeds
  },

  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: 'https://mochi.vikshan.tech', // base url
    failureURL: 'https://dub.sh/mochidocs', // failure redirect url
    port: process.env.PORT || '8080', // use Heroku's port or 8080 if run locally
  },

  ECONOMY: {
    ENABLED: true,
    CURRENCY: '₪',
    DAILY_COINS: 100, // coins to be received by daily command
    MIN_BEG_AMOUNT: 100, // minimum coins to be received when beg command is used
    MAX_BEG_AMOUNT: 2500, // maximum coins to be received when beg command is used
  },

  AICHAT: {
    MODEL: 'gpt-3.5-turbo', //Model Of AI to use
    TOKENS: 300, //The maximum number of tokens to generate in the completion.
    PRESENCE_PENALTY: 1.5, // Positive values penalize new tokens
    TEMPERATURE: 0.4, // What sampling temperature to use
    IMAGINEMESSAGE:
      'Imagine you are Mochi, a playful and energetic kawaii girl. 💖✨',
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
    BOT_EMBED: '#FFB3D9', // Soft pastel pink for a cute and friendly vibe
    TRANSPARENT: '#00000000',
    SUCCESS: '#B2FF6C', // Light green for positivity
    ERROR: '#FF6B6B', // Soft red for error messages, yet warm
    WARNING: '#FFF68F', // Light yellow for caution messages
  },
  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: '#FFC0CB', // Light pink for timeout
      UNTIMEOUT: '#B2FF6C', // Light green for untimeout
      KICK: '#FF6B6B', // Soft red for kick
      SOFTBAN: '#FFB3D9', // Soft pastel pink for softban
      BAN: '#D32F2F', // Strong red for ban
      UNBAN: '#00C853', // Green for unban
      VMUTE: '#FFC0CB', // Light pink for voice mute
      VUNMUTE: '#B2FF6C', // Light green for voice unmute
      DEAFEN: '#FFC0CB', // Light pink for deafen
      UNDEAFEN: '#B2FF6C', // Light green for undeafen
      DISCONNECT: 'RANDOM',
      MOVE: 'RANDOM',
    },
  },

  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: 'idle', // The bot's status [online, idle, dnd, invisible]
    TYPE: 'WATCHING', // Status type for the bot
    MESSAGE: '{servers} servers! 💖', // Your bot status message
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG:
      '{member:tag}, Yay! 🎉 You just leveled up to **Level {level}**! 🌟',
  },

  SUGGESTIONS: {
    ENABLED: true, // Should the suggestion system be enabled
    EMOJI: {
      UP_VOTE: '⬆️',
      DOWN_VOTE: '⬇️',
    },
    DEFAULT_EMBED: '#FFB3D9', // Soft pastel pink for default embeds
    APPROVED_EMBED: '#B2FF6C', // Light green for approved suggestions
    DENIED_EMBED: '#FF6B6B', // Soft red for denied suggestions
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: '#FFB3D9', // Soft pastel pink for ticket creation
    CLOSE_EMBED: '#B2FF6C', // Light green for ticket closure
  },

}