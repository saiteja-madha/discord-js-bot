const { Collection, MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// Utils
const { sendMessage } = require("@utils/botUtils");
const { containsLink } = require("@utils/miscUtils");
const { getRoleByName } = require("./guildUtils");
const { error } = require("../helpers/logger");

// Schemas
const { getSettings } = require("@schemas/Guild");
const { getMember } = require("@schemas/Member");
const { addModLogToDb } = require("@schemas/ModLog");

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
      return muteTarget(issuer, target, reason);

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
        .setAuthor("Moderation Case - " + type)
        .addField("Issuer", `${issuer.displayName} [${issuer.id}]`, false)
        .addField("Purge Type", data.purgeType, true)
        .addField("Messages", data.deletedCount.toString(), true)
        .addField("Channel", `#${data.channel.name} [${data.channel.id}]`, false);
      break;

    case "MUTE":
      embed.setColor(EMBED_COLORS.MUTE_LOG);
      break;

    case "UNMUTE":
      embed.setColor(EMBED_COLORS.UNMUTE_LOG);
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
      .setAuthor("Moderation Case - " + type)
      .setThumbnail(target.user.displayAvatarURL())
      .addField("Issuer", `${issuer.displayName} [${issuer.id}]`, false)
      .addField("Member", `${target.displayName} [${target.id}]`, false)
      .addField("Reason", reason || "No reason provided", true)
      .setTimestamp(Date.now());

    if (type.toUpperCase() === "MUTE") embed.addField("IsPermanent", "✓", true);
    if (type.toUpperCase() === "MOVE") embed.addField("Moved to", data.channel.name, true);
  }

  await addModLogToDb(issuer, target, reason, type.toUpperCase());
  sendMessage(logChannel, { embeds: [embed] });
}

/**
 * Setup muted role
 * @param {import('discord.js').Guild} guild
 */
async function setupMutedRole(guild) {
  let mutedRole;

  try {
    mutedRole = await guild.roles.create({
      name: "Muted",
      permissions: [],
      color: 11,
      position: guild.me.roles.highest.position,
    });

    guild.channels.cache.forEach(async (channel) => {
      if (channel.type !== "GUILD_VOICE" && channel.type !== "GUILD_STAGE_VOICE") {
        if (channel.permissionsFor(guild.me).has(["VIEW_CHANNEL", "MANAGE_CHANNELS"], true)) {
          await channel.permissionOverwrites.create(mutedRole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
          });
        }
      }

      if (channel.type === "GUILD_VOICE" || channel.type === "GUILD_STAGE_VOICE") {
        if (channel.permissionsFor(guild.me).has(["VIEW_CHANNEL", "MANAGE_CHANNELS"], true)) {
          await channel.permissionOverwrites.create(mutedRole, {
            CONNECT: false,
            SPEAK: false,
          });
        }
      }
    });
  } catch (ex) {
    error("setupMutedRole", ex);
  }
  return mutedRole;
}

/**
 * Delete the specified number of messages matching the type
 * @param {import('discord.js').import('discord.js').GuildMember} issuer
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
 * Checks if the target has the muted role
 * @param {import('discord.js').GuildMember} target
 */
function hasMutedRole(target) {
  let mutedRole = getRoleByName(target.guild, "muted");
  return target.roles.cache.has(mutedRole.id);
}

/**
 * Mutes the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function muteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  let mutedRole = getRoleByName(issuer.guild, "muted");

  if (!mutedRole) return "NO_MUTED_ROLE";
  if (!mutedRole.editable) return "NO_MUTED_PERMISSION";

  const memberDb = await getMember(issuer.guild.id, target.id);
  if (memberDb.mute?.active && hasMutedRole(target)) return "ALREADY_MUTED";

  try {
    if (!hasMutedRole(target)) await target.roles.add(mutedRole);
    memberDb.mute.active = true;
    await memberDb.save();
    logModeration(issuer, target, reason, "Mute", { isPermanent: true });

    return true;
  } catch (ex) {
    error("muteTarget", ex);
    return "ERROR";
  }
}

/**
 * Unmutes the target and logs to the database, channel
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember} target
 * @param {string} reason
 */
async function unmuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return "MEMBER_PERM";
  if (!memberInteract(issuer.guild.me, target)) return "BOT_PERM";

  const memberDb = await getMember(issuer.guild.id, target.id);
  if (!memberDb.mute?.active && !hasMutedRole(target)) return "NOT_MUTED";

  let mutedRole = getRoleByName(issuer.guild, "muted");
  try {
    if (hasMutedRole(target)) await target.roles.remove(mutedRole);
    memberDb.mute.active = false;
    await memberDb.save();

    logModeration(issuer, target, reason, "Unmute");
    return true;
  } catch (ex) {
    error("unmuteTarget", ex);
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
  setupMutedRole,
  muteTarget,
  unmuteTarget,
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
