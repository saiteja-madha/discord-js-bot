module.exports = {
  TEST_GUILD: "xxxxxxxxxx", // GuildId where the interactions should be registered. [** Test you commands here first **]
  OWNER_IDS: [], // Bot owner ID's
  PREFIX: "!", // Default prefix for the bot
  BOT_INVITE: "", // Your bot invite link
  SUPPORT_SERVER: "", // Your bot support server
  DASHBOARD: {
    enabled: true, // enable or disable dashboard
    baseURL: "http://localhost:8080", // base url
    failureURL: "http://localhost:8080", // failure redirect url
    port: "8080", // port to run the bot on
  },
  XP_SYSTEM: {
    COOLDOWN: 5, // Cooldown in seconds between messages
    DEFAULT_LVL_UP_MSG: "{m}, You just advanced to **Level {l}**",
  },
  MISCELLANEOUS: {
    DAILY_COINS: 100, // coins to be received by daily command
  },
  MUSIC: {
    MAX_SEARCH_RESULTS: 5,
    NODES: [
      {
        host: "disbotlistlavalink.ml",
        port: 443,
        password: "LAVA",
        identifier: "DBL Lavalink",
        retryDelay: 3000,
        secure: true,
      },
      {
        host: "lava.link",
        port: 80,
        password: "anything as a password",
        identifier: "Something Host",
        retryDelay: 3000,
        secure: false,
      },
    ],
  },
  /* Bot Embed Colors */
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT_EMBED: "#36393F",
    SUCCESS_EMBED: "#00A56A",
    ERROR_EMBED: "#D61A3C",
    WARNING_EMBED: "#F7E919",
    TICKET_CREATE: "#068ADD",
    TICKET_CLOSE: "#068ADD",
    MUTE_EMBED: "#102027",
    UNMUTE_EMBED: "#4B636E",
    KICK_EMBED: "#FF7961",
    SOFTBAN_EMBED: "#AF4448",
    BAN_EMBED: "#D32F2F",
    VMUTE_EMBED: "#102027",
    VUNMUTE_EMBED: "#4B636E",
    DEAFEN_EMBED: "#102027",
    UNDEAFEN_EMBED: "#4B636E",
    DISCONNECT_EMBED: "RANDOM",
    MOVE_EMBED: "RANDOM",
  },
  /* Various Emojis Used */
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
    GUILDS: 100,
    USERS: 1000,
    MEMBERS: 1000,
  },
  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },
};
