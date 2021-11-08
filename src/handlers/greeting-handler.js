const { MessageEmbed, GuildMember } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
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
 * @param {"WELCOME"|"FAREWELL"} type
 * @param {Object} config
 * @param {Object} inviterData
 */
const buildGreeting = async (member, type, config, inviterData) => {
  if (!config) return;
  let content;

  // build content
  if (config.content) content = await parse(config.content, member, inviterData);

  // build embed
  const embed = new MessageEmbed();
  if (config.embed.description) embed.setDescription(await parse(config.embed.description, member, inviterData));
  if (config.embed.color) embed.setColor(config.embed.color);
  if (config.embed.thumbnail) embed.setThumbnail(member.user.displayAvatarURL());
  if (config.embed.footer) {
    embed.setFooter(await parse(config.embed.footer, member, inviterData));
  }

  // set default message
  if (!config.content && !config.embed.description && !config.embed.footer) {
    content =
      type === "WELCOME" ? `Welcome to the server, ${member.displayName} 🎉` : `${member.tag} has left the server 👋`;
    return { content };
  }

  return { content, embeds: [embed] };
};

/**
 * Send welcome message
 * @param {GuildMember} member
 * @param {Object} inviterData
 */
async function sendWelcome(member, inviterData = {}) {
  const config = (await getSettings(member.guild))?.welcome;
  if (!config || !config.enabled) return;

  // check if channel exists
  const channel = member.guild.channels.cache.get(config.channel);
  if (!channel) return;

  // build welcome message
  const response = await buildGreeting(member, "WELCOME", config, inviterData);

  sendMessage(channel, response);
}

/**
 * Send farewell message
 * @param {GuildMember} member
 * @param {Object} inviterData
 */
async function sendFarewell(member, inviterData = {}) {
  const config = (await getSettings(member.guild))?.farewell;
  if (!config || !config.enabled) return;

  // check if channel exists
  const channel = member.guild.channels.cache.get(config.channel);
  if (!channel) return;

  // build farewell message
  const response = await buildGreeting(member, "FAREWELL", config, inviterData);

  sendMessage(channel, response);
}

module.exports = {
  buildGreeting,
  sendWelcome,
  sendFarewell,
};
