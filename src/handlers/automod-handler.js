const { Message, MessageEmbed } = require("discord.js");
const { sendMessage, safeDM } = require("@utils/botUtils");
const { containsLink, containsDiscordInvite } = require("@utils/miscUtils");
const { addStrikes } = require("@schemas/profile-schema");
const { addModAction } = require("@utils/modUtils");
const { EMBED_COLORS } = require("@root/config");
const Ascii = require("ascii-table");

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
    if (shouldDelete && message.deletable)
      message
        .delete()
        .then(async (_) => {
          const sentMsg = await sendMessage(channel, `> Auto-Moderation! Message deleted`);
          if (sentMsg?.deletable) setTimeout(() => sentMsg.delete().catch(() => {}), 5000);
        })
        .catch((ex) => {});

    // add strikes to member
    const profile = await addStrikes(message.guildId, author.id, strikesTotal);

    // send automod log
    embed
      .setAuthor("Auto Moderation")
      .setThumbnail(author.avatarURL())
      .setColor(message.client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`**Channel:** #${channel.name}\n**Content:**\n${content}`)
      .setFooter(`By ${author.tag} | ${author.id}`);

    sendMessage(logChannel, { embeds: [embed] });

    // DM strike details
    await safeDM(message.author, {
      content: ` > Guild: ${message.guild.name}
      > You received ${profile.strikes}/${automod.strikes} strikes!`,
      embeds: [getStrikeDetails(automod)],
    });

    // check if max strikes are received
    if (profile.strikes >= automod.strikes) {
      // Add Moderation
      await addModAction(message.guild.me, message.member, "Automod: Max strikes received", automod.action);

      // Reset Strikes
      await addStrikes(message.guildId, message.member.id, -profile.strikes);
    }
  }
}

function getStrikeDetails(automod) {
  const table = new Ascii("").setHeading("Feature", "Strikes");

  if (automod.max_lines) table.addRow("Max Lines", `1/line > ${automod.max_lines} lines`);
  if (automod.max_mentions) table.addRow("Mentions", `1/mention > ${automod.max_mentions} mentions`);
  if (automod.max_role_mentions) table.addRow("Role Mentions", `1/mention > ${automod.max_role_mentions} mentions`);
  if (automod.anti_links) table.addRow("Links", "1 per link");
  if (automod.anti_invites) table.addRow("Discord Invite", "1 per invite");
  if (automod.anti_ghostping) table.addRow("GhostPing", "1 per detection");
  if (automod.anti_scam) table.addRow("AntiScam", "1 per detection");

  return new MessageEmbed()
    .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
    .setAuthor("Strike Details")
    .setDescription("```" + table.toString() + "```");
}

module.exports = {
  performAutomod,
  getStrikeDetails,
};
