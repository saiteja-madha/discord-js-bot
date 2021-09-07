const { Message, Guild, GuildMember, TextChannel, Collection, MessageEmbed } = require("discord.js");
const { sendMessage } = require("@utils/botUtils");
const { containsLink, timeformat } = require("@utils/miscUtils");
const { addModLogToDb, removeMutes, getMuteInfo } = require("@schemas/modlog-schema");
const { getSettings } = require("@schemas/guild-schema");
const { EMOJIS } = require("@root/config");
const { getRoleByName } = require("./guildUtils");

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
 * Checks if both moderator and bot can interact with the target
 * @param {GuildMember} mod
 * @param {GuildMember} target
 * @param {String} action
 * @param {TextChannel} channel
 */
function canInteract(mod, target, action, channel) {
  if (!memberInteract(mod, target)) {
    sendMessage(channel, `Oops! You cannot \`${action}\` ${target.user.tag}`);
    return false;
  }

  if (!target.manageable) {
    sendMessage(channel, `Oops! I cannot \`${action}\` ${target.user.tag}`);
    return false;
  }

  return true;
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
    console.log(`Muted Role Creation Error: ${ex}`);
  }
  return mutedRole;
}

/**
 * Delete the specified number of messages matching the type
 * @param {Message} message
 * @param {"ATTACHMENT"|"BOT"|"LINK"|"TOKEN"|"USER"|"ALL"} type
 * @param {Number} amount
 */
async function purgeMessages(message, type, amount, argument) {
  const { channel } = message;
  const toDelete = new Collection();
  const messages = await channel.messages.fetch({ limit: amount }, false, true);

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

  if (toDelete.size === 0) {
    return sendMessage(channel, "Not found messages that can be purged!");
  }

  let deletedMessages;
  try {
    deletedMessages = await channel.bulkDelete(toDelete, true);
  } catch (ex) {
    console.log(ex);
    sendMessage(channel, "Purge failed");
  }

  if (deletedMessages) {
    const sentMsg = await sendMessage(channel, `Successfully purged ${deletedMessages.size} messages`);
    sentMsg.delete({ timeout: 3000 }).catch(() => {});
    await logModeration(message.member, "", "", "Purge", {
      purgeType: type,
      channel: message.channel,
      deletedCount: deletedMessages.size,
    });
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
  if (!memberInteract(issuer.guild.me, target)) return;

  let mutedRole = getRoleByName(issuer.guild, "muted");
  const previousMute = await getMuteInfo(issuer.guild.id, target.id);

  if (previousMute) {
    // maybe role was manually removed (so delete mute data)
    if (!hasMutedRole(target)) await removeMutes(target.guild.id, target.id);
    else {
      if (previousMute.data?.isPermanent) {
        return "ALREADY_MUTED"; // already muted
      }

      if (previousMute.data?.expires) {
        await removeMutes(target.guild.id, target.id);
      }
    }
  }

  try {
    await target.roles.add(mutedRole);
    await logModeration(issuer, target, reason, "Mute", { isPermanent: true });
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

/**
 * Unmutes the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function unmuteTarget(issuer, target, reason) {
  if (!memberInteract(issuer.guild.me, target)) return;

  const previousMute = await getMuteInfo(issuer.guild.id, target.id);
  if (!previousMute && !hasMutedRole(target)) return "NOT_MUTED";

  let mutedRole = getRoleByName(issuer.guild, "muted");
  try {
    await removeMutes(issuer.guild.id, target.id);
    if (target.roles.cache.has(mutedRole)) await target.roles.remove(mutedRole);
    await logModeration(issuer, target, reason, "Unmute");
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

/**
 * kicks the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function kickTarget(issuer, target, reason) {
  if (!memberInteract(issuer.guild.me, target)) return;
  try {
    await target.kick(reason);
    await logModeration(issuer, target, reason, "Kick");
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

/**
 * Softbans the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function softbanTarget(issuer, target, reason) {
  if (!memberInteract(issuer.guild.me, target)) return;
  try {
    await target.ban({ days: 7, reason });
    await issuer.guild.members.unban(target.user);
    await logModeration(issuer, target, reason, "Softban");
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

/**
 * Bans the target and logs to the database, channel
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 * @param {string} reason
 */
async function banTarget(issuer, target, reason) {
  if (!memberInteract(issuer.guild.me, target)) return;
  try {
    await target.ban({
      days: 0,
      reason,
    });
    await logModeration(issuer, target, reason, "Ban");
    return true;
  } catch (ex) {
    console.log(ex);
    return false;
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

    default:
      embed
        .setAuthor("Moderation Case - " + type)
        .setThumbnail(target.user.displayAvatarURL())
        .addField("Issuer", `${issuer.displayName} [${issuer.id}]`, false)
        .addField("Member", `${target.displayName} [${target.id}]`, false)
        .addField("Reason", reason || "No reason provided", true)
        .setTimestamp(Date.now());

      if (data.isPermanent) embed.addField("IsPermanent", EMOJIS.TICK, true);
      if (data.minutes) embed.addField("Expires In", timeformat(data.minutes * 60), true);
  }

  await addModLogToDb(issuer, target, reason, type.toUpperCase(), data);
  sendMessage(logChannel, { embeds: [embed] });
}

module.exports = {
  memberInteract,
  canInteract,
  setupMutedRole,
  purgeMessages,
  muteTarget,
  unmuteTarget,
  kickTarget,
  softbanTarget,
  banTarget,
  logModeration,
};
