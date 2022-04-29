const { MessageEmbed } = require("discord.js");
const { sendMessage, safeDM } = require("@utils/botUtils");
const { containsLink, containsDiscordInvite } = require("@utils/miscUtils");
const { getMember } = require("@schemas/Member");
const { addModAction } = require("@utils/modUtils");
const { AUTOMOD } = require("@root/config");
const { addAutoModLogToDb } = require("@schemas/AutomodLogs");

const antispamCache = new Map();
const MESSAGE_SPAM_THRESHOLD = 3000;

// Cleanup the cache
setInterval(() => {
  antispamCache.forEach((value, key) => {
    if (Date.now() - value.timestamp > MESSAGE_SPAM_THRESHOLD) {
      antispamCache.delete(key);
    }
  });
}, 10 * 60 * 1000);

/**
 * Check if the message needs to be moderated and has required permissions
 * @param {import('discord.js').Message} message
 */
const shouldModerate = (message) => {
  const { member, guild, channel } = message;

  // Ignore if bot cannot delete channel messages
  if (!channel.permissionsFor(guild.me).has("MANAGE_MESSAGES")) return false;

  // Ignore Possible Guild Moderators
  if (member.permissions.has(["KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_GUILD"])) return false;

  // Ignore Possible Channel Moderators
  if (channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) return false;
  return true;
};

/**
 * Perform moderation on the message
 * @param {import('discord.js').Message} message
 * @param {object} settings
 */
async function performAutomod(message, settings) {
  const { automod } = settings;

  if (automod.wh_channels.includes(message.channelId)) return;
  if (!automod.debug && !shouldModerate(message)) return;

  const { channel, member, guild, content, author, mentions } = message;
  const logChannel = settings.modlog_channel ? channel.guild.channels.cache.get(settings.modlog_channel) : null;

  let shouldDelete = false;
  let strikesTotal = 0;

  const embed = new MessageEmbed();

  // Max mentions
  if (mentions.members.size > automod.max_mentions) {
    embed.addField("Mentions", `${mentions.members.size}/${automod.max_mentions}`, true);
    strikesTotal += mentions.members.size - automod.max_mentions;
  }

  // Maxrole mentions
  if (mentions.roles.size > automod.max_role_mentions) {
    embed.addField("RoleMentions", `${mentions.roles.size}/${automod.max_role_mentions}`, true);
    strikesTotal += mentions.roles.size - automod.max_role_mentions;
  }

  if (automod.anti_massmention > 0) {
    // check everyone mention
    if (mentions.everyone) {
      embed.addField("Everyone Mention", "✓", true);
      strikesTotal += 1;
    }

    // check user/role mentions
    if (mentions.users.size + mentions.roles.size > automod.anti_massmention) {
      embed.addField(
        "User/Role Mentions",
        `${mentions.users.size + mentions.roles.size}/${automod.anti_massmention}`,
        true
      );
      strikesTotal += mentions.users.size + mentions.roles.size - automod.anti_massmention;
    }
  }

  // Max Lines
  if (automod.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > automod.max_lines) {
      embed.addField("New Lines", `${count}/${automod.max_lines}`, true);
      shouldDelete = true;
      strikesTotal += Math.ceil((count - automod.max_lines) / automod.max_lines);
    }
  }

  // Anti Attachments
  if (automod.anti_attachments) {
    if (message.attachments.size > 0) {
      embed.addField("Attachments Found", "✓", true);
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // Anti links
  if (automod.anti_links) {
    if (containsLink(content)) {
      embed.addField("Links Found", "✓", true);
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // Anti Spam
  if (!automod.anti_links && automod.anti_spam) {
    if (containsLink(content)) {
      const key = author.id + "|" + message.guildId;
      if (antispamCache.has(key)) {
        let antispamInfo = antispamCache.get(key);
        if (
          antispamInfo.channelId !== message.channelId &&
          antispamInfo.content === content &&
          Date.now() - antispamInfo.timestamp < MESSAGE_SPAM_THRESHOLD
        ) {
          embed.addField("AntiSpam Detection", "✓", true);
          shouldDelete = true;
          strikesTotal += 1;
        }
      } else {
        let antispamInfo = {
          channelId: message.channelId,
          content,
          timestamp: Date.now(),
        };
        antispamCache.set(key, antispamInfo);
      }
    }
  }

  // Anti Invites
  if (!automod.anti_links && automod.anti_invites) {
    if (containsDiscordInvite(content)) {
      embed.addField("Discord Invites", "✓", true);
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // delete message if deletable
  if (shouldDelete && message.deletable) {
    message
      .delete()
      .then(() => sendMessage(channel, "> Auto-Moderation! Message deleted", 5))
      .catch(() => {});
  }

  if (strikesTotal > 0) {
    // add strikes to member
    const memberDb = await getMember(guild.id, author.id);
    memberDb.strikes += strikesTotal;

    // log to db
    const reason = embed.fields.map((field) => field.name + ": " + field.value).join("\n");
    addAutoModLogToDb(member, content, reason, strikesTotal).catch(() => {});

    // send automod log
    embed
      .setAuthor({ name: "Auto Moderation" })
      .setThumbnail(author.displayAvatarURL())
      .setColor(AUTOMOD.LOG_EMBED)
      .setDescription(`**Channel:** ${channel.toString()}\n**Content:**\n${content}`)
      .setFooter({
        text: `By ${author.tag} | ${author.id}`,
        iconURL: author.avatarURL(),
      });

    sendMessage(logChannel, { embeds: [embed] });

    // DM strike details
    const strikeEmbed = new MessageEmbed()
      .setColor(AUTOMOD.DM_EMBED)
      .setThumbnail(guild.iconURL())
      .setAuthor({ name: "Auto Moderation" })
      .setDescription(
        `You have received ${strikesTotal} strikes!\n\n` +
          `**Guild:** ${guild.name}\n` +
          `**Total Strikes:** ${memberDb.strikes} out of ${automod.strikes}`
      );
    embed.fields.forEach((field) => strikeEmbed.addField(field.name, field.value, true));
    safeDM(author, { embeds: [strikeEmbed] });

    // check if max strikes are received
    if (memberDb.strikes >= automod.strikes) {
      // Reset Strikes
      memberDb.strikes = 0;

      // Add Moderation Action
      await addModAction(guild.me, member, "Automod: Max strikes received", automod.action).catch(() => {});
    }

    await memberDb.save();
  }
}

module.exports = {
  performAutomod,
};
