const { Collection, Guild, GuildMember, User } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const db = require("@schemas/invite-schema");

const getEffectiveInvites = (data = {}) =>
  data.tracked_invites + data.added_invites - data.fake_invites - data.left_invites || 0;

const cacheInvite = (invite, isVanity) => ({
  code: invite.code,
  uses: invite.uses,
  inviterId: isVanity ? "VANITY" : invite.inviter?.id,
});

/**
 * This function checks if invite tracking is enabled for the guild and then caches it
 *
 * @param {Guild} guild
 */
async function cacheGuildInvites(guild) {
  if (!guild || !(await getSettings(guild)).invite.tracking) return new Collection();
  const invites = await guild.invites.fetch();

  const tempMap = new Collection();
  invites.forEach((inv) => tempMap.set(inv.code, cacheInvite(inv)));
  if (guild.vanityURLCode) {
    tempMap.set(guild.vanityURLCode, cacheInvite(await guild.fetchVanityData(), true));
  }

  guild.client.inviteCache.set(guild.id, tempMap);
  return tempMap;
}

/**
 * Add roles to inviter based on invites count
 *
 * @param {Guild} guild
 * @param {object} inviterData
 * @param {boolean} isAdded
 * @returns
 */
const checkInviteRewards = async (guild, inviterData = {}, isAdded) => {
  const settings = await getSettings(guild);
  if (settings.invite.ranks.length > 0 && inviterData?.member_id) {
    const inviter = await guild.members.fetch(inviterData?.member_id).catch(() => {});
    if (!inviter) return;

    const invites = getEffectiveInvites(inviterData);
    settings.invite.ranks.forEach((reward) => {
      if (isAdded) {
        if (invites + 1 >= reward.invites && inviter.roles.cache.has(reward._id)) {
          inviter.roles.add(reward._id);
        }
      } else if (invites - 1 < reward.invites && inviter.roles.cache.has(reward._id)) {
        inviter.roles.remove(reward._id);
      }
    });
  }
};

/**
 * Track inviter by comparing new invites with cached invites
 *
 * @param {GuildMember} member
 */
async function trackJoinedMember(member) {
  const { guild } = member;

  const settings = await getSettings(guild);
  if (!settings.invite.tracking) return;

  const cachedInvites = guild.client.inviteCache.get(guild.id);
  const newInvites = await cacheGuildInvites(guild);
  const usedInvite = newInvites.find((inv) => cachedInvites.get(inv.code).uses < inv.uses);

  let inviterData = {};
  if (usedInvite) {
    const inviterId = usedInvite.code === guild.vanityURLCode ? "VANITY" : usedInvite.inviterId;
    await db.addInviter(guild.id, member.id, inviterId, usedInvite.code);
    inviterData = await db.incrementInvites(guild.id, inviterId, "TRACKED");
  }

  checkInviteRewards(guild, inviterData, true);
  return inviterData;
}

/**
 * Fetch inviter data from database
 * @param {Guild} guild
 * @param {User} user
 */
async function trackLeftMember(guild, user) {
  const settings = await getSettings(guild);
  if (!settings.invite.tracking) return;
  const inviteData = (await db.getDetails(guild.id, user.id)) || {};

  let inviterData = {};
  if (inviteData.inviter_id) {
    const inviterId = inviteData.inviter_id === "VANITY" ? "VANITY" : inviteData.inviter_id;
    inviterData = await db.incrementInvites(guild.id, inviterId, "LEFT");
  }

  checkInviteRewards(guild, inviterData, false);
  return inviterData;
}

module.exports = {
  trackJoinedMember,
  trackLeftMember,
  cacheGuildInvites,
  checkInviteRewards,
  getEffectiveInvites,
};
