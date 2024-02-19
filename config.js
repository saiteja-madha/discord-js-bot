module.exports = {
  OWNER_IDS: ["929835843479302204"], // Bot owner ID's
  SUPPORT_SERVER: "https://discord.gg/uMgS9evnmv", // Your bot support server
  DOCS_URL: "https://docs.vikshan.tech/mochi/", // Your bot documentation website
  DONATE_URL: "https://ko-fi.com/vikshan", // Your donation link
  GITHUB_URL: "https://github.com/vixshan/mochi", // Your bot github repository
  GITHUB_SPONSORS_URL: "https://github.com/sponsors/vixshan", // Your bot github sponsors link
  PATREON_URL: "https://www.patreon.com/vikshan", // Your bot patreon link
  BOTS_URL: "https://l.vikshan.tech/bots" , // Other bot's Invite Link
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: "!", // Default prefix for the bot
  },
  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: true, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    TEST_GUILD_ID: "1072214895598248030", // Guild ID where the interactions should be registered. [** Test you commands here first **]
  },
  EMBED_COLORS: {
    BOT_EMBED: "#00FFFF",
    TRANSPARENT: "#00000000",
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
  },
  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 10000,
    MEMBERS: 10000,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },

  // PLUGINS

  AUTOMOD: {
    ENABLED: true,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },

  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "https://mochi.vikshan.tech", // base url
    failureURL: "https://dub.sh/mochidocs", // failure redirect url
    port: process.env.PORT || "8080", // use Heroku's port or 8080 if run locally
},


  ECONOMY: {
    ENABLED: true,
    CURRENCY: "₪",
    DAILY_COINS: 100, // coins to be received by daily command
    MIN_BEG_AMOUNT: 100, // minimum coins to be received when beg command is used
    MAX_BEG_AMOUNT: 2500, // maximum coins to be received when beg command is used
  },

  AICHAT: {
    MODEL: "gpt-3.5-turbo", //Model Of AI to use https://platform.openai.com/docs/models/gpt-3-5
    TOKENS: 300, //The maximum number of tokens to generate in the completion. https://platform.openai.com/docs/api-reference/completions/create
    PRESENCE_PENALTY: 1.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    TEMPERATURE: 0.4, // What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
    IMAGINEMESSAGE: "" // Allows the chatbot to tailor its responses to your intended persona. for example: "imagine you are Rayan Ghostling,you should answer like he would". This feature is optional and can be left blank if not needed.
  },


  MUSIC: {
    ENABLED: true,
    IDLE_TIME: 60, // Time in seconds before the bot disconnects from an idle voice channel
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: "SC", // YT = Youtube, YTM = Youtube Music, SC = SoundCloud
    // Add any number of lavalink nodes here
    // Refer to https://github.com/freyacodes/Lavalink to host your own lavalink server
    LAVALINK_NODES: [
      {
        host: "lavalink.lexnet.cc",
        port: 443,
        password: "lexn3tl@val!nk",
       id: "Lavalink",
        secure: true,
      },
    ],
  },

  GIVEAWAYS: {
    ENABLED: true,
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  IMAGE: {
    ENABLED: true,
    BASE_API: "https://strangeapi.hostz.me/api",
  },

  INVITE: {
    ENABLED: true,
  },

  MODERATION: {
    ENABLED: true,
    EMBED_COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },

  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: "dnd", // The bot's status [online, idle, dnd, invisible]
    TYPE: "WATCHING", // Status type for the bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: "{members} members in {servers} servers", // Your bot status message
  },

  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{member:tag}, You just advanced to **Level {level}**",
  },

  SUGGESTIONS: {
    ENABLED: true, // Should the suggestion system be enabled
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#4F545C",
    APPROVED_EMBED: "#43B581",
    DENIED_EMBED: "#F04747",
  },

  TICKET: {
    ENABLED: true,
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
};
