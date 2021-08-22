const { TextBasedChannels, MessagePayload, MessageOptions } = require("discord.js");
const { getResponse } = require("@utils/httpUtils");
const config = require("@root/config.js");

async function startupCheck() {
  await checkForUpdates();
  validateConfig();
}

async function checkForUpdates() {
  const response = await getResponse("https://api.github.com/repos/saiteja-madha/discord-js-bot/releases/latest");
  if (!response.success) return console.log("\x1b[31m[Version Check] - Failed to check for bot updates\x1b[0m");
  if (response.data) {
    if (require("@root/package.json").version.replace(/[^0-9]/g, "") >= response.data.tag_name.replace(/[^0-9]/g, "")) {
      console.log("\x1b[32m[Version Check] - Your discord bot is up to date\x1b[0m");
    } else {
      console.log("\x1b[33m[Version Check] - " + response.data.tag_name + " update is available\x1b[0m");
      console.log("\x1b[32m[Download]:\x1b[0m https://github.com/saiteja-madha/discord-js-bot/releases/latest");
    }
  }
}

function validateConfig() {
  if (config.BOT_TOKEN === "") {
    console.log("\x1b[31m[config.js]\x1b[0m - BOT_TOKEN cannot be empty");
    process.exit();
  }
  if (config.MONGO_CONNECTION === "") {
    console.log("\x1b[31m[config.js]\x1b[0m - MONGO_CONNECTION cannot be empty");
    process.exit();
  }
  if (config.OWNER_IDS.length === 0) console.log("\x1b[33m[config.js]\x1b[0m - OWNER_IDS are empty");
  if (!config.API.IMAGE_API) {
    console.log("\x1b[33m[config.js]\x1b[0m - IMAGE_API is not provided. Image commands will not work");
  }
  if (!config.BOT_INVITE) console.log("\x1b[33m[config.js]\x1b[0m - BOT_INVITE is not provided");
  if (!config.SUPPORT_SERVER) console.log("\x1b[33m[config.js]\x1b[0m - SUPPORT_SERVER is not provided");
  if (isNaN(config.CACHE_SIZE.GUILDS) || isNaN(config.CACHE_SIZE.USERS) || isNaN(config.CACHE_SIZE.COUNTER)) {
    console.log("\x1b[31m[config.js]\x1b[0m - CACHE_SIZE must be a positive integer");
    process.exit();
  }
  if (!config.PREFIX) {
    console.log("\x1b[31m[config.js]\x1b[0m - PREFIX cannot be empty");
    process.exit();
  }
}

/**
 * @param {TextBasedChannels} channel
 * @param {string | MessagePayload | MessageOptions} message
 */
async function sendMessage(channel, message) {
  if (!channel || !message) return;
  if (channel.type === "GUILD_STAGE_VOICE" && channel.type === "GUILD_VOICE") return;
  try {
    return await channel.send(message);
  } catch (ex) {
    console.log(`[ERROR] - [sendMessage] - ${ex.message}`);
  }
}

const permissions = {
  ADMINISTRATOR: "Administrator",
  VIEW_AUDIT_LOG: "View audit log",
  MANAGE_GUILD: "Manage server",
  MANAGE_ROLES: "Manage roles",
  MANAGE_CHANNELS: "Manage channels",
  KICK_MEMBERS: "Kick members",
  BAN_MEMBERS: "Ban members",
  CREATE_INSTANT_INVITE: "Create instant invite",
  CHANGE_NICKNAME: "Change nickname",
  MANAGE_NICKNAMES: "Manage nicknames",
  MANAGE_EMOJIS: "Manage emojis",
  MANAGE_WEBHOOKS: "Manage webhooks",
  VIEW_CHANNEL: "View channels",
  SEND_MESSAGES: "Send messages",
  SEND_TTS_MESSAGES: "Send TTS messages",
  MANAGE_MESSAGES: "Manage messages",
  EMBED_LINKS: "Embed links",
  ATTACH_FILES: "Attach files",
  READ_MESSAGE_HISTORY: "Read message history",
  MENTION_EVERYONE: "Mention everyone",
  USE_EXTERNAL_EMOJIS: "Use external emojis",
  ADD_REACTIONS: "Add reactions",
  CONNECT: "Connect",
  SPEAK: "Speak",
  MUTE_MEMBERS: "Mute members",
  DEAFEN_MEMBERS: "Deafen members",
  MOVE_MEMBERS: "Move members",
  USE_VAD: "Use voice activity",
  PRIORITY_SPEAKER: "Priority speaker",
  VIEW_GUILD_INSIGHTS: "View server insights",
  STREAM: "Video",
};

module.exports = {
  permissions,
  sendMessage,
  startupCheck,
};
