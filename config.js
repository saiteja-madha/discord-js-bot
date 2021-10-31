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
  MUSIC: {
    MAX_SEARCH_RESULTS: 5, // max results to be fetched from youtube
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
  ECONOMY: {
    DAILY_COINS: 100, // coins to be received by daily command
    CURRENCY: "₪", // currency symbol
  },
  /* Bot Embed Colors */
  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
    TICKET_CREATE: "#068ADD",
    TICKET_CLOSE: "#068ADD",
    AUTOMOD: "#36393F",
    MUTE_LOG: "#102027",
    UNMUTE_LOG: "#4B636E",
    KICK_LOG: "#FF7961",
    SOFTBAN_LOG: "#AF4448",
    BAN_LOG: "#D32F2F",
    VMUTE_LOG: "#102027",
    VUNMUTE_LOG: "#4B636E",
    DEAFEN_LOG: "#102027",
    UNDEAFEN_LOG: "#4B636E",
    DISCONNECT_LOG: "RANDOM",
    MOVE_LOG: "RANDOM",
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
