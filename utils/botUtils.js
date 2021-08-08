const { GuildMember, Message, TextBasedChannels, MessagePayload, MessageOptions } = require("discord.js");

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
  return await channel.send(message).catch((ex) => console.log(`[ERROR] - [sendMessage] - ${ex.message}`));
}

module.exports = {
  getMember,
  timeformat,
  permissions,
  sendMessage,
};
