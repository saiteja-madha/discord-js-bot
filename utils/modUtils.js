const { Message, Guild, GuildMember, TextChannel, Collection } = require("discord.js");
const { sendMessage } = require("./botUtils");
const { containsLink } = require("./miscUtils");

/**
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
 * @param { Guild } guild
 */
async function setupMutedRole(guild) {
  let mutedRole;

  try {
    mutedRole = await guild.roles.create({
      data: {
        name: "Muted",
        permissions: [],
        color: 11,
        position: guild.me.roles.highest.position,
      },
    });

    guild.channels.cache.forEach(async (channel, id) => {
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

    return mutedRole;
  } catch (ex) {
    console.log("Muted Role Creation Error: " + ex);
    return mutedRole;
  }
}

/**
 * @param {Message} message
 * @param {String} type
 * @param {Number} amount
 */
async function purgeMessages(message, type, amount, argument) {
  const { channel } = message;
  const toDelete = new Collection();
  const messages = await channel.messages.fetch(
    {
      limit: amount,
    },
    false,
    true
  );

  messages.every((msg) => {
    if (toDelete.size == amount) return false;
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
    }

    return true;
  });

  if (toDelete.size == 0) {
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
    sentMsg
      .delete({
        timeout: 3000,
      })
      .catch((ex) => {
        /* Ignore */
      });
  }
}

/**
 * @param {GuildMember} issuer
 * @param {GuildMember} target
 */
function memberInteract(issuer, target) {
  const { guild } = issuer;
  if (guild.ownerID === issuer.id) return true;
  if (guild.ownerID === target.id) return false;
  const issuerRoles = issuer.roles.cache;
  const targetRoles = target.roles.cache;
  return (
    !issuerRoles.size == 0 && (targetRoles.size == 0 || issuer.roles.highest.position < target.roles.highest.position)
  );
}

module.exports = {
  canInteract,
  setupMutedRole,
  purgeMessages,
};
