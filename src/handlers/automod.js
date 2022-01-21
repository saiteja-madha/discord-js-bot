const { MessageEmbed } = require("discord.js");
const { sendMessage, safeDM } = require("@utils/botUtils");
const { containsLink, containsDiscordInvite } = require("@utils/miscUtils");
const { getMember } = require("@schemas/Member");
const { addModAction } = require("@utils/modUtils");
const { EMBED_COLORS } = require("@root/config");

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
 */
async function performAutomod(message, settings) {
  const { automod } = settings;

  if (!automod.debug && !shouldModerate(message)) return;

  const { channel, content, author, mentions } = message;
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

  // Max Lines
  if (automod.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > automod.max_lines) {
      embed.addField("New Lines", `${count}/${automod.max_lines}`, true);
      shouldDelete = true;
      strikesTotal += Math.ceil((count - automod.max_lines) / automod.max_lines);
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
          embed.addField("AntiScam Detection", "✓", true);
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
    const memberDb = await getMember(message.guildId, author.id);
    memberDb.strikes += strikesTotal;

    // send automod log
    embed
      .setAuthor({ name: "Auto Moderation" })
      .setThumbnail(author.displayAvatarURL())
      .setColor(EMBED_COLORS.AUTOMOD)
      .setDescription(`**Channel:** ${channel.toString()}\n**Content:**\n${content}`)
      .setFooter({
        text: `By ${author.tag} | ${author.id}`,
        iconURL: author.avatarURL(),
      });

    sendMessage(logChannel, { embeds: [embed] });

    // DM strike details
    const strikeEmbed = new MessageEmbed()
      .setColor(EMBED_COLORS.AUTOMOD)
      .setThumbnail(message.guild.iconURL())
      .setAuthor({ name: "Auto Moderation" })
      .setDescription(
        `You have received ${strikesTotal} strikes!\n\n` +
          `**Guild:** ${message.guild.name}\n` +
          `**Total Strikes:** ${memberDb.strikes} out of ${automod.strikes}`
      );
    embed.fields.forEach((field) => strikeEmbed.addField(field.name, field.value, true));
    safeDM(message.author, { embeds: [strikeEmbed] });

    // check if max strikes are received
    if (memberDb.strikes >= automod.strikes) {
      await addModAction(message.guild.me, message.member, "Automod: Max strikes received", automod.action); // Add Moderation Action
      memberDb.strikes = 0; // Reset Strikes
    }

    await memberDb.save();
  }
}

module.exports = {
  performAutomod,
};
