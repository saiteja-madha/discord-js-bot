const {
  Guild,
  GuildMember,
  Collection,
  MessageEmbed,
  BaseGuildTextChannel,
  VoiceChannel,
  StageChannel,
} = require("discord.js");
const { sendMessage } = require("@utils/botUtils");
const { containsLink, timeformat } = require("@utils/miscUtils");
const { addModLogToDb, removeMutes, getMuteInfo } = require("@schemas/modlog-schema");
const { getSettings } = require("@schemas/guild-schema");
const { addWarnings } = require("@schemas/profile-schema");
const { EMOJIS, EMBED_COLORS } = require("@root/config");
const { getRoleByName } = require("./guildUtils");
const { error } = require("../helpers/logger");

const purgePerms = ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"];

/**
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 */
function memberInteract(issuer, target) {
  const { guild } = issuer;
  if (guild.ownerId === issuer.id) return true;
  if (guild.ownerId === target.id) return false;
  return issuer.roles.highest.position > target.roles.highest.position;
}

/**
 * Setup muted role
 * @param {Guild} guild
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
 * @param {string} messageId
 * @param {GuildMember} issuer
 * @param {BaseGuildTextChannel} channel
 * @param {"ATTACHMENT"|"BOT"|"LINK"|"TOKEN"|"USER"|"ALL"} type
 * @param {Number} amount
 */
async function purgeMessages(issuer, channel, type, amount, argument) {
  if (!channel.permissionsFor(issuer).has(purgePerms)) {
    return {
      success: false,
      message: `You do not have permissions to Read Message History & Manage Messages in ${channel}`,
    };
  }

  if (!channel.permissionsFor(issuer.guild.me).has(purgePerms)) {
    return {
      success: false,
      message: `I do not have permissions to Read Message History & Manage Messages in ${channel}`,
    };
  }

  const toDelete = new Collection();

  try {
    const messages = await channel.messages.fetch({ limit: amount }, { cache: false, force: true });
    messages.every((msg) => {
      if (toDelete.size === amount) return false;
      const { id } = msg;

      switch (type) {
        case "ATTACHMENT":
          if (msg.attachments.size > 0) toDelete.set(id, msg);
          break;

        case "BOT":
          if (msg.author.bot) toDelete.set(id, msg);
          break;

        case "LINK":
          if (containsLink(msg.content)) toDelete.set(id, msg);
          break;

        case "TOKEN":
          if (msg.content.includes(argument)) toDelete.set(id, msg);
          break;

        case "USER":
          if (argument.includes(msg.author.id)) toDelete.set(id, msg);
          break;

        case "ALL":
          toDelete.set(id, msg);
          break;

        default:
          return;
      }

      return true;
    });

    if (toDelete.size === 0)
      return {
        success: false,
        message: "No messages found that can be cleaned",
      };

    const deletedMessages = await channel.bulkDelete(toDelete, true);
    await logModeration(issuer, "", "", "Purge", {
      purgeType: type,
      channel: channel,
      deletedCount: deletedMessages.size,
    });

    return {
      success: true,
      message: `Successful cleaned ${deletedMessages.size} messages`,
    };
  } catch (ex) {
    error("purgeMessages", ex);
    return {
      success: false,
      message: `Oops! Failed to delete messages`,
    };
  }
}

/**
 * warns the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function warnTarget(issuer, target, reason) {
  const { guild } = issuer;

  if (!memberInteract(issuer, target)) return `Oops! You cannot warn ${target.user.tag}`;
  if (!memberInteract(guild.me, target)) return `Oops! I cannot warn ${target.user.tag}`;

  try {
    await logModeration(issuer, target, reason, "Warn");
    const profile = await addWarnings(guild.id, target.id, 1);
    const settings = await getSettings(guild);

    // check if max warnings are reached
    if (profile.warnings > settings.max_warnings) {
      await addModAction(guild.me, target, "Max warnings reached", settings.max_warn_action); // moderate
      await addWarnings(guild.id, target.id, -profile.warnings); // reset warnings
    }

    return `${target.user.tag} is warned! ${profile.warnings}/${settings.max_warnings} warnings`;
  } catch (ex) {
    error("warnTarget", ex);
    return `Failed to warn ${target.user.tag}`;
  }
}

/**
 * Checks if the target has the muted role
 * @param {GuildMember} target
 */
function hasMutedRole(target) {
  let mutedRole = getRoleByName(target.guild, "muted");
  return target.roles.cache.has(mutedRole.id);
}

/**
 * Mutes the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function muteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot mute ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot mute ${target.user.tag}`;

  let mutedRole = getRoleByName(issuer.guild, "muted");

  if (!mutedRole) return "NO_MUTED_ROLE";
  if (!mutedRole.editable) return "NO_MUTED_PERMISSION";

  const previousMute = await getMuteInfo(issuer.guild.id, target.id);

  if (previousMute) {
    if (previousMute.data?.isPermanent && hasMutedRole(target)) return "ALREADY_MUTED"; // already muted
    await removeMutes(target.guild.id, target.id); // remove existing tempmute data
  }

  try {
    if (!hasMutedRole(target)) await target.roles.add(mutedRole);
    await logModeration(issuer, target, reason, "Mute", { isPermanent: true });
    return `${target.user.tag} is now muted on this server`;
  } catch (ex) {
    error("muteTarget", ex);
    return `Failed to mute ${target.user.tag}`;
  }
}

/**
 * Unmutes the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function unmuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot unmute ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot unmute ${target.user.tag}`;

  const previousMute = await getMuteInfo(issuer.guild.id, target.id);
  if (!previousMute && !hasMutedRole(target)) return "NOT_MUTED";

  let mutedRole = getRoleByName(issuer.guild, "muted");
  try {
    await removeMutes(issuer.guild.id, target.id);
    if (hasMutedRole(target)) await target.roles.remove(mutedRole);
    await logModeration(issuer, target, reason, "Unmute");
    return `${target.user.tag} is now unmuted`;
  } catch (ex) {
    error("unmuteTarget", ex);
    return `Failed to unmute ${target.user.tag}`;
  }
}

/**
 * kicks the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function kickTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot kick ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot kick ${target.user.tag}`;
  try {
    await target.kick(reason);
    await logModeration(issuer, target, reason, "Kick");
    return `${target.user.tag} is kicked from this server`;
  } catch (ex) {
    error("kickTarget", ex);
    return `Failed to kick ${target.user.tag}`;
  }
}

/**
 * Softban's the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function softbanTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot softban ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot softban ${target.user.tag}`;
  try {
    await target.ban({ days: 7, reason });
    await issuer.guild.members.unban(target.user);
    await logModeration(issuer, target, reason, "Softban");
    return `${target.user.tag} is soft-banned from this server`;
  } catch (ex) {
    error("softbanTarget", ex);
    return `Failed to softban ${target.user.tag}`;
  }
}

/**
 * Bans the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function banTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot ban ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot ban ${target.user.tag}`;
  try {
    await target.ban({
      days: 0,
      reason,
    });
    await logModeration(issuer, target, reason, "Ban");
    return `${target.user.tag} is banned from this server`;
  } catch (ex) {
    error(`banTarget`, ex);
    return `Failed to ban ${target.user.tag}`;
  }
}

/**
 * Voice mutes the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function vMuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot voice mute ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot voice mute ${target.user.tag}`;
  if (!target.voice.channel) return `${target.user.tag} is not in any voice channel`;
  if (target.voice.mute) return `${target.user.tag} is already muted`;

  try {
    await target.voice.setMute(true, reason);
    await logModeration(issuer, target, reason, "Vmute");
    return `${target.user.tag} is voice muted in this server`;
  } catch (ex) {
    error(`vMuteTarget`, ex);
    return `Failed to voice mute ${target.user.tag}`;
  }
}

/**
 * Voice unmutes the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function vUnmuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot unmute ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot unmute ${target.user.tag}`;
  if (!target.voice.channel) return `${target.user.tag} is not in any voice channel`;
  if (!target.voice.mute) return `${target.user.tag} is not muted`;

  try {
    await target.voice.setMute(false, reason);
    await logModeration(issuer, target, reason, "Vmute");
    return `${target.user.tag} is unmuted in this server`;
  } catch (ex) {
    error(`vUnmuteTarget`, ex);
    return `Failed to unmute ${target.user.tag}`;
  }
}

/**
 * Deafens the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function deafenTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot deafen ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot deafen ${target.user.tag}`;
  if (!target.voice.channel) return `${target.user.tag} is not in any voice channel`;
  if (target.voice.deaf) return `${target.user.tag} is already deafened`;

  try {
    await target.voice.setDeaf(true, reason);
    await logModeration(issuer, target, reason, "Vmute");
    return `${target.user.tag} is deafened in this server`;
  } catch (ex) {
    error(`deafenTarget`, ex);
    return `Failed to deafen ${target.user.tag}`;
  }
}

/**
 * UnDeafens the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function unDeafenTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot undeafen ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot undeafen ${target.user.tag}`;
  if (!target.voice.channel) return `${target.user.tag} is not in any voice channel`;
  if (!target.voice.deaf) return `${target.user.tag} is not deafened`;

  try {
    await target.voice.setDeaf(false, reason);
    await logModeration(issuer, target, reason, "unDeafen");
    return `${target.user.tag} is undeafen in this server`;
  } catch (ex) {
    error(`unDeafenTarget`, ex);
    return `Failed to undeafen ${target.user.tag}`;
  }
}

/**
 * Disconnects the target from voice channel and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function disconnectTarget(issuer, target, reason) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot disconnect ${target.user.tag} from VC`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot disconnect ${target.user.tag} from VC`;
  if (!target.voice.channel) return `${target.user.tag} is not in any voice channel`;

  try {
    await target.voice.disconnect(reason);
    await logModeration(issuer, target, reason, "Disconnect");
    return `${target.user.tag} is disconnected from voice channel`;
  } catch (ex) {
    error(`unDeafenTarget`, ex);
    return `Failed to disconnect ${target.user.tag} from voice channel`;
  }
}

/**
 * Moves the target to another voice channel and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 * @param {VoiceChannel|StageChannel} channel
 */
async function moveTarget(issuer, target, reason, channel) {
  if (!memberInteract(issuer, target)) return `Oops! You cannot move ${target.user.tag}`;
  if (!memberInteract(issuer.guild.me, target)) return `Oops! I cannot move ${target.user.tag}`;
  if (!target.voice?.channel) return `${target.user.tag} is not in any voice channel`;
  if (target.voice.channelId === channel.id) return `${target.user.tag} is already in ${channel.name}`;

  if (!channel.permissionsFor(target).has(["VIEW_CHANNEL", "CONNECT"])) {
    return `${target.user.tag} doesn't have enough permissions to connect to ${channel.name}`;
  }

  try {
    await target.voice.setChannel(channel, reason);
    await logModeration(issuer, target, reason, "Move", {
      channel,
    });
    return `${target.user.tag} is moved to ${channel.name}`;
  } catch (ex) {
    error(`moveTarget`, ex);
    return `Failed to move ${target.user.tag} to ${channel.name}`;
  }
}

/**
 * Send logs to the configured channel and stores in the database
 * @param {string} type
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
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
      embed.setColor(EMBED_COLORS.MUTE_EMBED);
      break;

    case "UNMUTE":
      embed.setColor(EMBED_COLORS.UNMUTE_EMBED);
      break;

    case "KICK":
      embed.setColor(EMBED_COLORS.KICK_EMBED);
      break;

    case "SOFTBAN":
      embed.setColor(EMBED_COLORS.SOFTBAN_EMBED);
      break;

    case "BAN":
      embed.setColor(EMBED_COLORS.BAN_EMBED);
      break;

    case "VMUTE":
      embed.setColor(EMBED_COLORS.VMUTE_EMBED);
      break;

    case "VUNMUTE":
      embed.setColor(EMBED_COLORS.VUNMUTE_EMBED);
      break;

    case "DEAFEN":
      embed.setColor(EMBED_COLORS.DEAFEN_EMBED);
      break;

    case "UNDEAFEN":
      embed.setColor(EMBED_COLORS.UNDEAFEN_EMBED);
      break;

    case "DISCONNECT":
      embed.setColor(EMBED_COLORS.DISCONNECT_EMBED);
      break;

    case "MOVE":
      embed.setColor(EMBED_COLORS.MOVE_EMBED);
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

    if (data.isPermanent) embed.addField("IsPermanent", EMOJIS.TICK, true);
    if (data.minutes) embed.addField("Expires In", timeformat(data.minutes * 60), true);
    if (data.channel) embed.addField("Moved to", data.channel.name, true);
  }

  await addModLogToDb(issuer, target, reason, type.toUpperCase(), data);
  sendMessage(logChannel, { embeds: [embed] });
}

/**
 * Add a moderation action
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 * @param {"WARN"|"MUTE"|"UNMUTE"|"KICK"|"SOFTBAN"|"BAN"|"VMUTE"|"VUNMUTE"|"DEAFEN"|"UNDEAFEN"|"DISCONNECT"|"MOVE"} action
 * @param {any} data
 */
async function addModAction(issuer, target, reason, action, data) {
  switch (action) {
    case "WARN":
      return warnTarget(issuer, target, reason);

    case "MUTE":
      return muteTarget(issuer, target, reason);

    case "UNMUTE":
      return unmuteTarget(issuer, target, reason);

    case "KICK":
      return kickTarget(issuer, target, reason);

    case "SOFTBAN":
      return softbanTarget(issuer, target, reason);

    case "BAN":
      return banTarget(issuer, target, reason);

    case "VMUTE":
      return vMuteTarget(issuer, target, reason);

    case "VUNMUTE":
      return vUnmuteTarget(issuer, target, reason);

    case "DEAFEN":
      return deafenTarget(issuer, target, reason);

    case "UNDEAFEN":
      return unDeafenTarget(issuer, target, reason);

    case "DISCONNECT":
      return disconnectTarget(issuer, target, reason);

    case "MOVE":
      return moveTarget(issuer, target, reason, data);
  }
}

module.exports = {
  memberInteract,
  setupMutedRole,
  purgeMessages,
  addModAction,
};
