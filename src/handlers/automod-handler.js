const { Message, MessageEmbed } = require("discord.js");
const { sendMessage } = require("@utils/botUtils");
const { containsLink, containsDiscordInvite } = require("@utils/miscUtils");
const { addStrikes } = require("@schemas/profile-schema");
const { muteTarget, kickTarget, banTarget } = require("@utils/modUtils");

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
async function performAutomod(message, settings) {
  if (!settings) return;
  const { automod } = settings;

  if (!automod.debug && !shouldModerate(message)) return;

  const { channel, content, author, mentions } = message;
  const logChannel = settings.modlog_channel ? channel.guild.channels.cache.get(settings.modlog_channel) : null;

  let shouldDelete = false;
  let strikesTotal = 0;

  const embed = new MessageEmbed();

  // Max mentions
  if (mentions.members.size > automod.max_mentions) {
    embed.addField("Mentions", mentions.members.size.toString(), true);
    strikesTotal += mentions.members.size - automod.max_mentions;
  }

  // Maxrole mentions
  if (mentions.roles.size > automod.max_role_mentions) {
    embed.addField("RoleMentions", mentions.roles.size.toString(), true);
    strikesTotal += mentions.roles.size - automod.max_role_mentions;
  }

  // Max Lines
  if (automod.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > automod.max_lines) {
      embed.addField("New Lines", count.toString(), true);
      strikesTotal += Math.ceil((count - automod.max_lines) / automod.max_lines);
    }
  }

  // Anti links
  if (automod.anti_links) {
    if (containsLink(content)) {
      embed.addField("Links Found", message.client.config.EMOJIS.TICK, true);
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  // Anti Scam
  if (!automod.anti_links && automod.anti_scam) {
    if (containsLink(content)) {
      const key = message.author.id + "|" + message.guildId;
      if (message.client.antiScamCache.has(key)) {
        let antiScamInfo = message.client.antiScamCache.get(key);
        if (
          antiScamInfo.channelId !== message.channelId &&
          antiScamInfo.content === content &&
          Date.now() - antiScamInfo.timestamp < 2000
        ) {
          embed.addField("AntiScam Found", message.client.config.EMOJIS.TICK, true);
          shouldDelete = true;
          strikesTotal += 1;
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
  if (!automod.anti_links && automod.anti_invites) {
    if (containsDiscordInvite(content)) {
      embed.addField("Discord Invites", message.client.config.EMOJIS.TICK, true);
      shouldDelete = true;
      strikesTotal += 1;
    }
  }

  if (shouldDelete || strikesTotal > 0) {
    // delete message if deletable
    if (shouldDelete && message.deletable) await message.delete().catch((ex) => {});

    // add strikes to member
    const profile = await addStrikes(message.guildId, author.id, strikesTotal);

    embed
      .setAuthor("Auto Moderation")
      .setThumbnail(author.avatarURL())
      .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`**Content:**\n ${content}`)
      .setFooter(`By ${author.tag} in #${channel.name}`);

    const sentMsg = await sendMessage(
      channel,
      `${message.member.toString()}\n` +
        `> Auto-Moderation! ${shouldDelete ? "Message deleted" : ""}\n` +
        `> You received ${profile.strikes}/${automod.strikes} strikes!`
    );

    setTimeout(() => sentMsg.delete().catch(() => {}), 5000);
    sendMessage(logChannel, { embeds: [embed] });

    if (profile.strikes >= automod.strikes) {
      const reason = "Automod: Max strikes received";

      switch (automod.action) {
        case "MUTE":
          await muteTarget(message.guild.me, message.member, reason);
          break;

        case "KICK":
          await kickTarget(message.guild.me, message.member, reason);
          break;

        case "BAN":
          await banTarget(message.guild.me, message.member, reason);
          break;
      }

      // Reset Strikes
      await addStrikes(message.guildId, message.member.id, -profile.strikes);
    }
  }
}

module.exports = {
  performAutomod,
};
