module.exports = {
  BOT_TOKEN: "", // Your discord bot token
  MONGO_CONNECTION: "", // URI of the mongo database
  JOIN_LEAVE_WEBHOOK: "", // Webhook to which guild join/leave details will be sent
  OWNER_IDS: [], // Bot owner ID's
  PREFIX: "!", // Default prefix for the bot
  BOT_INVITE: "", // Your bot invite link
  SUPPORT_SERVER: "", // Your bot support server
  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url
    failureURL: "http://localhost:8080", // failure redirect url
    secret: "xxxxxxxxxxx", // bot secret
    port: "8080", // port to run the bot on
    expressSessionPassword: "discordbot", // random password string
  },
  SLASH_COMMANDS: {
    GLOBAL: false, // Should the slash commands be registered globally
    TEST_GUILD_ID: "xxxxxxxxxx", // Guild ID where the slash commands should be registered. [** Test you commands here first **]
  },
  XP_SYSTEM: {
    COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{m}, You just advanced to **Level {l}**",
  },
  API: {
    IMAGE_API: "https://discord-js-image-manipulation.herokuapp.com", // Image commands won't work without this
    WEATHERSTACK_KEY: "", // https://weatherstack.com/
  },
  /* Bot Embed Colors */
  EMBED_COLORS: {
    BOT_EMBED: "0x068ADD",
    TRANSPARENT_EMBED: "0x36393F",
    SUCCESS_EMBED: "0x00A56A",
    ERROR_EMBED: "0xD61A3C",
    WARNING_EMBED: "0xF7E919",
  },
  /* Unicode Emojis Used */
  EMOJIS: {
    ARROW: "❯",
    ARROW_BULLET: "»",
    CIRCLE_BULLET: "•",
    CUBE_BULLET: "❒",
    WHITE_DIAMOND_SUIT: "♢",
    TICK: "✓",
    X_MARK: "✕",
    CURRENCY: "₪",
    TICKET_OPEN: "🎫",
    TICKET_CLOSE: "🔒",
  },
  /* Maximum number of keys that can be stored */
  CACHE_SIZE: {
    GUILDS: 10,
    USERS: 1000,
    MEMBERS: 10,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },
};
