const { Client, MessageEmbed, GuildMember } = require("discord.js");
const { getConfig, setChannel } = require("@schemas/greeting-schema");
const { sendMessage } = require("@utils/botUtils");
const { getSettings } = require("@schemas/guild-schema");

/**
 * @param {Client} client
 */
async function run(client) {
  client.on("guildMemberAdd", async (member) => {
    if (member.user.bot) return;
    const { guild } = member;

    const settings = await getSettings(guild);
    if (!settings.invite.tracking) await handleGreeting(member, true);
  });

  client.on("guildMemberRemove", async (member) => {
    if (member.partial) member = await member.fetch();
    if (member.user.bot) return;
    const { guild } = member;

    const settings = await getSettings(guild);
    if (!settings.invite.tracking) await handleGreeting(member, true);
  });
}

/**
 * @param {GuildMember} member
 * @param {Boolean} added
 * @param {Object} inviterData
 */
async function handleGreeting(member, added, inviterData = {}) {
  const { guild } = member;

  const config = added ? (await getConfig(guild.id))?.welcome : (await getConfig(guild.id))?.farewell;
  if (!config) return;

  const channel = guild.channels.cache.get(config.channel_id);
  if (!channel) return await setChannel(guild.id, null, added ? "welcome" : "farewell");

  const embed = await buildEmbed(member, config.embed, inviterData);
  if (embed) sendMessage(channel, { embeds: [embed] });
}

/**
 * @param {GuildMember} member
 * @param {Object} config
 * @param {Object} inviterData
 */
async function buildEmbed(member, config, inviterData) {
  if (!config) return;

  const embed = new MessageEmbed();
  if (config.description) embed.setDescription(await parse(config.description, member, inviterData));
  if (config.color) embed.setColor(config.color);
  if (config.thumbnail) embed.setThumbnail(member.user.displayAvatarURL());
  if (config.footer) embed.setFooter(await parse(config.footer, member, inviterData));

  return embed.length && embed;
}

/**
 * @param {String} content
 * @param {GuildMember} member
 * @param {Object} inviterData
 */
async function parse(content, member, inviterData = {}) {
  let inviteData = {};

  if (content.includes("{inviter:")) {
    let inviterId = inviterData.member_id || "NA";
    if (inviterId !== "VANITY" && inviterId !== "NA") {
      let inviter = await member.guild.members.fetch(inviterId);
      inviteData.name = inviter.displayName;
      inviteData.tag = inviter.user.tag;
    } else {
      inviteData.name = inviteData.tag = inviterId;
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
}

function getEffectiveInvites(data) {
  return data?.tracked_invites + data?.added_invites - data?.fake_invites - data?.left_invites || 0;
}

module.exports = {
  run,
  handleGreeting,
  buildEmbed,
};
