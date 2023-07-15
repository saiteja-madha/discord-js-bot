const { EmbedBuilder } = require("discord.js");
const { containsLink, containsDiscordInvite } = require("@helpers/Utils");
const { getMember } = require("@schemas/Member");
const { addModAction } = require("@helpers/ModUtils");
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
  if (!channel.permissionsFor(guild.members.me)?.has("ManageMessages")) return false;

  // Ignore Possible Guild Moderators
  if (member.permissions.has(["KickMembers", "BanMembers", "ManageGuild"])) return false;

  // Ignore Possible Channel Moderators
  if (channel.permissionsFor(message.member).has("ManageMessages")) return false;
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

  const fields = [];

  // Max mentions
  if (mentions.members.size > automod.max_mentions) {
    fields.push({ name: "Mentions", value: `${mentions.members.size}/${automod.max_mentions}`, inline: true });
    // strikesTotal += mentions.members.size - automod.max_mentions;
    strikesTotal += 1;
  }

  // Maxrole mentions
  if (mentions.roles.size > automod.max_role_mentions) {
    fields.push({ name: "RoleMentions", value: `${mentions.roles.size}/${automod.max_role_mentions}`, inline: true });
    // strikesTotal += mentions.roles.size - automod.max_role_mentions;
    strikesTotal += 1;
  }

  if (automod.anti_massmention > 0) {
    // check everyone mention
    if (mentions.everyone) {
      fields.push({ name: "Everyone Mention", value: "✓", inline: true });
      strikesTotal += 1;
    }

    // check user/role mentions
    if (mentions.users.size + mentions.roles.size > automod.anti_massmention) {
      fields.push({
        name: "User/Role Mentions",
        value: `${mentions.users.size + mentions.roles.size}/${automod.anti_massmention}`,
        inline: true,
      });
      // strikesTotal += mentions.users.size + mentions.roles.size - automod.anti_massmention;
      strikesTotal += 1;
    }
  }

  // Max Lines
  if (automod.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > automod.max_lines) {
      fields.push({ name: "New Lines", value: `${count}/${automod.max_lines}`, inline: true });
      shouldDelete = true;
      // strikesTotal += Math.ceil((count - automod.max_lines) / automod.max_lines);
      strikesTotal += 1;
    }
  }

  // Anti Attachments
  if (automod.anti_attachments) {
    if (message.attachments.size > 0) {
      fields.push({ name: "Attachments Found", value: "✓", inline: true });
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // Anti links
  if (automod.anti_links) {
    if (containsLink(content)) {
      fields.push({ name: "Links Found", value: "✓", inline: true });
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
          fields.push({ name: "AntiSpam Detection", value: "✓", inline: true });
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
      fields.push({ name: "Discord Invites", value: "✓", inline: true });
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // delete message if deletable
  if (shouldDelete && message.deletable) {
    message
      .delete()
      .then(() => channel.safeSend("> Auto-Moderation! Message deleted", 5))
      .catch(() => {});
  }

  if (strikesTotal > 0) {
    // add strikes to member
    const memberDb = await getMember(guild.id, author.id);
    memberDb.strikes += strikesTotal;

    // log to db
    const reason = fields.map((field) => field.name + ": " + field.value).join("\n");
    addAutoModLogToDb(member, content, reason, strikesTotal).catch(() => {});

    // send automod log
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({ name: "Auto Moderation" })
        .setThumbnail(author.displayAvatarURL())
        .setColor(AUTOMOD.LOG_EMBED)
        .addFields(fields)
        .setDescription(`**Channel:** ${channel.toString()}\n**Content:**\n${content}`)
        .setFooter({
          text: `By ${author.username} | ${author.id}`,
          iconURL: author.avatarURL(),
        });

      logChannel.safeSend({ embeds: [logEmbed] });
    }

    // DM strike details
    const strikeEmbed = new EmbedBuilder()
      .setColor(AUTOMOD.DM_EMBED)
      .setThumbnail(guild.iconURL())
      .setAuthor({ name: "Auto Moderation" })
      .addFields(fields)
      .setDescription(
        `You have received ${strikesTotal} strikes!\n\n` +
          `**Guild:** ${guild.name}\n` +
          `**Total Strikes:** ${memberDb.strikes} out of ${automod.strikes}`
      );

    author.send({ embeds: [strikeEmbed] }).catch((ex) => {});

    // check if max strikes are received
    if (memberDb.strikes >= automod.strikes) {
      // Reset Strikes
      memberDb.strikes = 0;

      // Add Moderation Action
      await addModAction(guild.members.me, member, "Automod: Max strikes received", automod.action).catch(() => {});
    }

    await memberDb.save();
  }
}

module.exports = {
  performAutomod,
};
