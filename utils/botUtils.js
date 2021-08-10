const { Message, TextBasedChannels, MessagePayload, MessageOptions } = require("discord.js");
const { getResponse } = require("@utils/httpUtils");
const config = require("@root/config.json");

async function startupCheck() {
  // Check for updates
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

  // Validate .env and config.json
  if (process.env.BOT_TOKEN === "") {
    console.log("\x1b[31m[.env]\x1b[0m - BOT_TOKEN cannot be empty");
    process.exit();
  }
  if (process.env.MONGO_CONNECTION === "") {
    console.log("\x1b[31m[.env]\x1b[0m - MONGO_CONNECTION cannot be empty");
    process.exit();
  }
  if (config.OWNER_IDS.length === 0) console.log("\x1b[33m[config.json]\x1b[0m - OWNER_IDS are empty");
  if (!config.IMAGE_API) {
    console.log("\x1b[33m[config.json]\x1b[0m - IMAGE_API is not provided. Image commands will not work");
  }
  if (!config.BOT_INVITE) console.log("\x1b[33m[config.json]\x1b[0m - BOT_INVITE is not provided");
  if (!config.DISCORD_INVITE) console.log("\x1b[33m[config.json]\x1b[0m - DISCORD_INVITE is not provided");
  if (!config.CACHE_SIZE || isNaN(config.CACHE_SIZE) || config.CACHE_SIZE <= 0) {
    console.log("\x1b[31m[config.json]\x1b[0m - CACHE_SIZE must be a positive integer");
    process.exit();
  }
  if (!config.PREFIX) {
    console.log("\x1b[31m[config.json]\x1b[0m - PREFIX cannot be empty");
    process.exit();
  }
}

/**
 * @param {Message} message
 * @param {String} search
 */
async function getMember(message, search, exact = false) {
  if (!message || !search) return;
  let member;
  const patternMatch = new RegExp("<?@?!?(\\d{17,20})>?", "g").exec(search);
  if (patternMatch) {
    let id = patternMatch[1];
    member = await message.channel.guild.members.fetch(id, { cache: true }).catch((ex) => {});
  }

  if (!member && !exact) {
    member = message.channel.guild.members.cache.find(
      (x) =>
        x.user.username.toLowerCase().includes(search.toLowerCase()) ||
        x.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }

  return member;
}

/**
 * @param {String} timeInSeconds
 */
function timeformat(timeInSeconds) {
  var days = Math.floor((timeInSeconds % 31536000) / 86400);
  var hours = Math.floor((timeInSeconds % 86400) / 3600);
  var minutes = Math.floor((timeInSeconds % 3600) / 60);
  var seconds = Math.round(timeInSeconds % 60);
  return (
    (days > 0 ? days + " days, " : "") +
    (hours > 0 ? hours + " hours, " : "") +
    (minutes > 0 ? minutes + " minutes, " : "") +
    (seconds > 0 ? seconds + " seconds" : "")
  );
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

module.exports = {
  startupCheck,
  getMember,
  timeformat,
  permissions,
  sendMessage,
};
