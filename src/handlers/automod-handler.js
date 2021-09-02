const { Message, MessageEmbed } = require("discord.js");
const { sendMessage } = require("@utils/botUtils");
const { containsLink, containsDiscordInvite } = require("@utils/miscUtils");
const { automodLogChannel } = require("@schemas/guild-schema");

/**
 * Check if the message needs to be moderated and has required permissions
 * @param {Message} message
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
 * @param {Message} message
 */
function performAutomod(message, settings) {
  if (!settings) return;
  if (!shouldModerate(message)) return;

  const { channel, content, author, mentions } = message;

  const logChannel = settings.log_channel ? channel.guild.channels.cache.get(settings.log_channel) : null;

  let str = "**Reason:**\n";
  let shouldDelete = false;

  // Max mentions
  if (mentions.members.size > settings.max_mentions) {
    str += `Mentions: ${mentions.members.size}\n`;
    shouldDelete = true;
  }

  // Maxrole mentions
  if (mentions.roles.size > settings.max_role_mentions) {
    str += `RoleMentions: ${mentions.roles.size}\n`;
    shouldDelete = true;
  }

  // Max Lines
  if (settings.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > settings.max_lines) {
      str += `New Lines: ${count}\n`;
      shouldDelete = true;
    }
  }

  // Anti links
  if (settings.anti_links) {
    if (containsLink(content)) {
      str += `Links Found: ${message.client.config.EMOJIS.TICK}\n`;
      shouldDelete = true;
    }
  }

  // Anti Scam
  if (!settings.anti_links && settings.anti_scam) {
    if (containsLink(content)) {
      const key = message.author.id + "|" + message.guildId;
      if (message.client.antiScamCache.has(key)) {
        let antiScamInfo = message.client.antiScamCache.get(key);
        if (
          antiScamInfo.channelId !== message.channelId &&
          antiScamInfo.content === content &&
          Date.now() - antiScamInfo.timestamp < 5000
        ) {
          str += `AntiScam Found: ${message.client.config.EMOJIS.TICK}\n`;
          shouldDelete = true;
        }
      } else {
        let antiScamInfo = {
          channelId: message.channelId,
          content,
          timestamp: Date.now(),
        };
        message.client.antiScamCache.set(key, antiScamInfo);
      }
    }
  }

  // Anti Invites
  if (!settings.anti_links && settings.anti_invites) {
    if (containsDiscordInvite(content)) {
      str += `Discord Invites Found: ${message.client.config.EMOJIS.TICK}\n`;
      shouldDelete = true;
    }
  }

  if (shouldDelete && message.deletable) {
    const embed = new MessageEmbed()
      .setAuthor("Auto Moderation")
      .setThumbnail(author.avatarURL())
      .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(str)
      .addField("Content", content, false)
      .addField("Author", author.tag, true)
      .addField("Channel", channel.toString(), true);

    message
      .delete()
      .then(async () => {
        const sentMsg = await sendMessage(channel, "Auto-Moderation. Message deleted!");
        if (sentMsg) {
          setTimeout(() => {
            if (sentMsg.deletable) sentMsg.delete().catch(() => {});
          }, 3000);
        }
        if (logChannel) sendMessage(logChannel, { embeds: [embed] });
        else automodLogChannel(channel.guild.id, null);
      })
      .catch(() => {});
  }
}

module.exports = {
  performAutomod,
};
