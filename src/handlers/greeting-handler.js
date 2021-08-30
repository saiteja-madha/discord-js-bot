const { MessageEmbed, GuildMember } = require("discord.js");
const { getConfig, setChannel } = require("@schemas/greeting-schema");
const { sendMessage } = require("@utils/botUtils");

const getEffectiveInvites = (data = {}) =>
  data.tracked_invites + data.added_invites - data.fake_invites - data.left_invites || 0;

/**
 * @param {String} content
 * @param {GuildMember} member
 * @param {Object} inviterData
 */
const parse = async (content, member, inviterData = {}) => {
  const inviteData = {};

  if (content.includes("{inviter:")) {
    const inviterId = inviterData.member_id || "NA";
    if (inviterId !== "VANITY" && inviterId !== "NA") {
      const inviter = await member.guild.members.fetch(inviterId);
      inviteData.name = inviter.displayName;
      inviteData.tag = inviter.user.tag;
    } else {
      inviteData.name = inviterId;
      inviteData.tag = inviterId;
    }
  }
  return content
    .replaceAll(/\\n/g, "\n")
    .replaceAll(/{server}/g, member.guild.name)
    .replaceAll(/{count}/g, member.guild.memberCount)
    .replaceAll(/{member:name}/g, member.displayName)
    .replaceAll(/{member:tag}/g, member.user.tag)
    .replaceAll(/{inviter:name}/g, inviteData.name)
    .replaceAll(/{inviter:tag}/g, inviteData.tag)
    .replaceAll(/{invites}/g, getEffectiveInvites(inviterData));
};

/**
 * @param {GuildMember} member
 * @param {Object} config
 * @param {Object} inviterData
 */
const buildEmbed = async (member, config, inviterData) => {
  if (!config) return;

  const embed = new MessageEmbed();
  if (config.description) {
    embed.setDescription(await parse(config.description, member, inviterData));
  }
  if (config.color) embed.setColor(config.color);
  if (config.thumbnail) embed.setThumbnail(member.user.displayAvatarURL());
  if (config.footer) {
    embed.setFooter(await parse(config.footer, member, inviterData));
  }

  return embed;
};

/**
 * Send welcome message
 * @param {GuildMember} member
 * @param {Object} inviterData
 */
async function sendWelcome(member, inviterData = {}) {
  const config = await getConfig(member.guild.id)?.welcome;
  if (!config) return;

  // check if channel exists
  const channel = member.guild.channels.cache.get(config.channel_id);
  if (!channel) {
    return setChannel(member.guild.id, null, "welcome");
  }

  // set default description
  if (!config.embed.description) {
    config.embed.description = "Welcome to the server {member:name}";
  }

  const embed = await buildEmbed(member, config.embed, inviterData);
  sendMessage(channel, { embeds: [embed] });
}

/**
 * Send farewell message
 * @param {GuildMember} member
 * @param {Object} inviterData
 */
async function sendFarewell(member, inviterData = {}) {
  const config = await getConfig(member.guild.id)?.farewell;
  if (!config) return;

  // check if channel exists
  const channel = member.guild.channels.cache.get(config.channel_id);
  if (!channel) return setChannel(member.guild.id, null, "farewell");

  // set default description
  if (!config.embed.description) {
    config.embed.description = "Goodbye {member:tag}!";
  }

  const embed = await buildEmbed(member, config.embed, inviterData);
  sendMessage(channel, { embeds: [embed] });
}

module.exports = {
  sendWelcome,
  sendFarewell,
  buildEmbed,
};
