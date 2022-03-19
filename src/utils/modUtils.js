const { Collection, MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// Utils
const { sendMessage } = require("@utils/botUtils");
const { containsLink } = require("@utils/miscUtils");
const { error } = require("../helpers/logger");

// Schemas
const { getSettings } = require("@schemas/Guild");
const { getMember } = require("@schemas/Member");
const { addModLogToDb } = require("@schemas/ModLog");

const DEFAULT_TIMEOUT_DAYS = 7;

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 */
function memberInteract(issuer, target) {
  const { guild } = issuer;
  if (guild.ownerId === issuer.id) return true;
  if (guild.ownerId === target.id) return false;
  return issuer.roles.highest.position > target.roles.highest.position;
}

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 * @param {"MUTE"|"KICK"|"SOFTBAN"|"BAN"} action
 */
async function addModAction(issuer, target, reason, action) {
  switch (action) {
    case "MUTE":
      return timeoutTarget(issuer, target, DEFAULT_TIMEOUT_DAYS * 24 * 60, reason);

    case "KICK":
      return kickTarget(issuer, target, reason);

    case "SOFTBAN":
      return softbanTarget(issuer, target, reason);

    case "BAN":
      return banTarget(issuer, target, reason);
  }
}

/**
 * Send logs to the configured channel and stores in the database
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 * @param {string} type
 * @param {Object} data
 */
async function logModeration(issuer, target, reason, type, data = {}) {
  if (!type) return;
  const { guild } = issuer;
  const settings = await getSettings(guild);

  let logChannel;
  if (settings.modlog_channel) logChannel = guild.channels.cache.get(settings.modlog_channel);

  const embed = new MessageEmbed();
  switch (type.toUpperCase()) {
    case "PURGE":
      embed
        .setAuthor({ name: `Moderation Case - ${type}` })
        .addField("Issuer", `${issuer.displayName} [${issuer.id}]`, false)
        .addField("Purge Type", data.purgeType, true)
        .addField("Messages", data.deletedCount.toString(), true)
        .addField("Channel", `#${data.channel.name} [${data.channel.id}]`, false);
      break;

    case "TIMEOUT":
      embed.setColor(EMBED_COLORS.TIMEOUT_LOG);
      break;

    case "UNTIMEOUT":
      embed.setColor(EMBED_COLORS.UNTIMEOUT_LOG);
      break;

    case "KICK":
      embed.setColor(EMBED_COLORS.KICK_LOG);
      break;

    case "SOFTBAN":
      embed.setColor(EMBED_COLORS.SOFTBAN_LOG);
      break;

    case "BAN":
      embed.setColor(EMBED_COLORS.BAN_LOG);
      break;

    case "VMUTE":
      embed.setColor(EMBED_COLORS.VMUTE_LOG);
      break;

    case "VUNMUTE":
      embed.setColor(EMBED_COLORS.VUNMUTE_LOG);
      break;

    case "DEAFEN":
      embed.setColor(EMBED_COLORS.DEAFEN_LOG);
      break;

    case "UNDEAFEN":
      embed.setColor(EMBED_COLORS.UNDEAFEN_LOG);
      break;

    case "DISCONNECT":
      embed.setColor(EMBED_COLORS.DISCONNECT_LOG);
      break;

    case "MOVE":
      embed.setColor(EMBED_COLORS.MOVE_LOG);
      break;
  }

  if (type.toUpperCase() !== "PURGE") {
    embed
      .setAuthor({ name: `Moderation Case - ${type}` })
      .setThumbnail(target.user.displayAvatarURL())
      .addField("Issuer", `${issuer.displayName} [${issuer.id}]`, false)
      .addField("Member", `${target.displayName} [${target.id}]`, false)
      .addField("Reason", reason || "No reason provided", true)
      .setTimestamp(Date.now());

    if (type.toUpperCase() === "TIMEOUT") {
      embed.addField("Expires", `<t:${Math.round(target.communicationDisabledUntilTimestamp / 1000)}:R>`, true);
    }
    if (type.toUpperCase() === "MOVE") embed.addField("Moved to", data.channel.name, true);
  }

  await addModLogToDb(issuer, target, reason, type.toUpperCase());
  sendMessage(logChannel, { embeds: [embed] });
}

/**
 * Delete the specified number of messages matching the type
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').BaseGuildTextChannel} channel
 * @param {"ATTACHMENT"|"BOT"|"LINK"|"TOKEN"|"USER"|"ALL"} type
 * @param {Number} amount
 */
async function purgeMessages(issuer, channel, type, amount, argument) {
  if (!channel.permissionsFor(issuer).has(["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"])) {
    return "MEMBER_PERM";
  }

  if (!channel.permissionsFor(issuer.guild.me).has(["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"])) {
    return "BOT_PERM";
  }

  const toDelete = new Collection();

  try {
    const messages = await channel.messages.fetch({ limit: amount }, { cache: false, force: true });

    for (const message of messages.values()) {
      if (toDelete.size >= amount) break;
      if (!message.deletable) continue;

      if (type === "ALL") {
        toDelete.set(message.id, message);
      } else if (type === "ATTACHMENT") {
        if (message.attachments.size > 0) {
          toDelete.set(message.id, message);
        }
      } else if (type === "BOT") {
        if (message.author.bot) {
          toDelete.set(message.id, message);
        }
      } else if (type === "LINK") {
        if (containsLink(message.content)) {
          toDelete.set(message.id, message);
        }
      } else if (type === "TOKEN") {
        if (message.content.includes(argument)) {
          toDelete.set(message.id, message);
        }
      } else if (type === "USER") {
        if (message.author.id === argument) {
          toDelete.set(message.id, message);
        }
      }
    }

    if (toDelete.size === 0) return "NO_MESSAGES";

    const deletedMessages = await channel.bulkDelete(toDelete, true);
    await logModeration(issuer, "", "", "Purge", {
      purgeType: type,
      channel: channel,
      deletedCount: deletedMessages.size,
    });

    return deletedMessages.size;
  } catch (ex) {
    error("purgeMessages", ex);
    return "ERROR";
  }
}

/**
 * warns the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function warnTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  try {
    logModeration(issuer, target, reason, "Warn");
    const memberDb = await getMember(issuer.guild.id, target.id);
    memberDb.warnings += 1;
    const settings = await getSettings(issuer.guild);

    // check if max warnings are reached
    if (memberDb.warnings >= settings.max_warn.limit) {
      await addModAction(issuer.guild.me, target, "Max warnings reached", settings.max_warn.action); // moderate
      memberDb.warnings = 0; // reset warnings
    }

    await memberDb.save();
    return true;
  } catch (ex) {
    error("warnTarget", ex);
    return "ERROR";
  }
}

/**
 * Timeouts(aka mutes) the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {number} minutes
 * @param {string} reason
 */
async function timeoutTarget(issuer, target, minutes, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";
  if (target.communicationDisabledUntilTimestamp - Date.now() > 0) return "ALREADY_TIMEOUT";

  try {
    await target.timeout(minutes * 60 * 1000, reason);
    logModeration(issuer, target, reason, "Timeout", { minutes });
    return true;
  } catch (ex) {
    error("timeoutTarget", ex);
    return "ERROR";
  }
}

/**
 * UnTimeouts(aka mutes) the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {number} minutes
 * @param {string} reason
 */
async function unTimeoutTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";
  if (target.communicationDisabledUntilTimestamp - Date.now() < 0) return "NO_TIMEOUT";

  try {
    await target.timeout(0, reason);
    logModeration(issuer, target, reason, "UnTimeout");
    return true;
  } catch (ex) {
    error("unTimeoutTarget", ex);
    return "ERROR";
  }
}

/**
 * kicks the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function kickTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  try {
    await target.kick(reason);
    logModeration(issuer, target, reason, "Kick");
    return true;
  } catch (ex) {
    error("kickTarget", ex);
    return "ERROR";
  }
}

/**
 * Softbans the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function softbanTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  try {
    await target.ban({ days: 7, reason });
    await issuer.guild.members.unban(target.user);
    logModeration(issuer, target, reason, "Softban");
    return true;
  } catch (ex) {
    error("softbanTarget", ex);
    return "ERROR";
  }
}

/**
 * Bans the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function banTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  try {
    await target.ban({ days: 0, reason });
    logModeration(issuer, target, reason, "Ban");
    return true;
  } catch (ex) {
    error(`banTarget`, ex);
    return "ERROR";
  }
}

/**
 * Voice mutes the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function vMuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  if (!target.voice.channel) return "NO_VOICE";
  if (target.voice.mute) return "ALREADY_MUTED";

  try {
    await target.voice.setMute(true, reason);
    logModeration(issuer, target, reason, "Vmute");
    return true;
  } catch (ex) {
    error(`vMuteTarget`, ex);
    return "ERROR";
  }
}

/**
 * Voice unmutes the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function vUnmuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  if (!target.voice.channel) return "NO_VOICE";
  if (!target.voice.mute) return "NOT_MUTED";

  try {
    await target.voice.setMute(false, reason);
    logModeration(issuer, target, reason, "Vmute");
    return true;
  } catch (ex) {
    error(`vUnmuteTarget`, ex);
    return "ERROR";
  }
}

/**
 * Deafens the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function deafenTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  if (!target.voice.channel) return "NO_VOICE";
  if (target.voice.deaf) return "ALREADY_DEAFENED";

  try {
    await target.voice.setDeaf(true, reason);
    logModeration(issuer, target, reason, "Deafen");
    return true;
  } catch (ex) {
    error(`deafenTarget`, ex);
    return `Failed to deafen ${target.user.tag}`;
  }
}

/**
 * UnDeafens the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function unDeafenTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  if (!target.voice.channel) return "NO_VOICE";
  if (!target.voice.deaf) return "NOT_DEAFENED";

  try {
    await target.voice.setDeaf(false, reason);
    logModeration(issuer, target, reason, "unDeafen");
    return true;
  } catch (ex) {
    error(`unDeafenTarget`, ex);
    return "ERROR";
  }
}

/**
 * Disconnects the target from voice channel and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function disconnectTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  if (!target.voice.channel) return "NO_VOICE";

  try {
    await target.voice.disconnect(reason);
    logModeration(issuer, target, reason, "Disconnect");
    return true;
  } catch (ex) {
    error(`unDeafenTarget`, ex);
    return "ERROR";
  }
}

/**
 * Moves the target to another voice channel and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 * @param {import('discord.js').VoiceChannel|import('discord.js').StageChannel} channel
 */
async function moveTarget(issuer, target, reason, channel) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  if (!target.voice?.channel) return "NO_VOICE";
  if (target.voice.channelId === channel.id) return "ALREADY_IN_CHANNEL";

  if (!channel.permissionsFor(target).has(["VIEW_CHANNEL", "CONNECT"])) return "TARGET_PERM";

  try {
    await target.voice.setChannel(channel, reason);
    logModeration(issuer, target, reason, "Move", { channel });
    return true;
  } catch (ex) {
    error(`moveTarget`, ex);
    return "ERROR";
  }
}

module.exports = {
  memberInteract,
  addModAction,
  warnTarget,
  purgeMessages,
  timeoutTarget,
  unTimeoutTarget,
  kickTarget,
  softbanTarget,
  banTarget,
  vMuteTarget,
  vUnmuteTarget,
  deafenTarget,
  unDeafenTarget,
  disconnectTarget,
  moveTarget,
};
