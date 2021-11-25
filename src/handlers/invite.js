const { Collection } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const { getMember } = require("@schemas/Member");

const getEffectiveInvites = (inviteData = {}) =>
  inviteData.tracked + inviteData.added - inviteData.fake - inviteData.left || 0;

const cacheInvite = (invite, isVanity) => ({
  code: invite.code,
  uses: invite.uses,
  maxUses: invite.maxUses,
  inviterId: isVanity ? "VANITY" : invite.inviter?.id,
});

/**
 * This function caches all invites for the provided guild
 * @param {import("discord.js").Guild} guild
 */
async function cacheGuildInvites(guild) {
  if (!guild.me.permissions.has("MANAGE_GUILD")) return new Collection();
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
 * @param {import("discord.js").Guild} guild
 * @param {Object} inviterData
 * @param {boolean} isAdded
 */
const checkInviteRewards = async (guild, inviterData = {}, isAdded) => {
  const settings = await getSettings(guild);
  if (settings.invite.ranks.length > 0 && inviterData?.member_id) {
    const inviter = await guild.members.fetch(inviterData?.member_id).catch(() => {});
    if (!inviter) return;

    const invites = getEffectiveInvites(inviterData.invite_data);
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
 * @param {import("discord.js").GuildMember} member
 */
async function trackJoinedMember(member) {
  const { guild } = member;

  const cachedInvites = guild.client.inviteCache.get(guild.id);
  const newInvites = await cacheGuildInvites(guild);

  // return if no cached data
  if (!cachedInvites) return {};
  let usedInvite;

  // compare newInvites with cached invites
  usedInvite = newInvites.find(
    (inv) => inv.uses !== 0 && cachedInvites.get(inv.code) && cachedInvites.get(inv.code).uses < inv.uses
  );

  // Special case: Invitation was deleted after member's arrival and
  // just before GUILD_MEMBER_ADD (https://github.com/Androz2091/discord-invites-tracker/blob/29202ee8e85bb1651f19a466e2c0721b2373fefb/index.ts#L46)
  if (!usedInvite) {
    cachedInvites
      .sort((a, b) => (a.deletedTimestamp && b.deletedTimestamp ? b.deletedTimestamp - a.deletedTimestamp : 0))
      .forEach((invite) => {
        if (
          !newInvites.get(invite.code) && // If the invitation is no longer present
          invite.maxUses > 0 && // If the invitation was indeed an invitation with a limited number of uses
          invite.uses === invite.maxUses - 1 // What if the invitation was about to reach the maximum number of uses
        ) {
          usedInvite = invite;
        }
      });
  }

  let inviterData = {};
  if (usedInvite) {
    const inviterId = usedInvite.code === guild.vanityURLCode ? "VANITY" : usedInvite.inviterId;

    // log invite data
    const memberDb = await getMember(guild.id, member.id);
    memberDb.invite_data.inviter = inviterId;
    memberDb.invite_data.code = usedInvite.code;
    await memberDb.save();

    // increment inviter's invites
    const inviterDb = await getMember(guild.id, inviterId);
    inviterDb.invite_data.tracked += 1;
    await inviterDb.save();
    inviterData = inviterDb;
  }

  checkInviteRewards(guild, inviterData, true);
  return inviterData;
}

/**
 * Fetch inviter data from database
 * @param {import("discord.js").Guild} guild
 * @param {import("discord.js").User} user
 */
async function trackLeftMember(guild, user) {
  const settings = await getSettings(guild);
  if (!settings.invite.tracking) return;
  const inviteData = (await getMember(guild.id, user.id)).invite_data;

  let inviterData = {};
  if (inviteData.inviter) {
    const inviterId = inviteData.inviter === "VANITY" ? "VANITY" : inviteData.inviter;
    const inviterDb = await getMember(guild.id, inviterId);
    inviterDb.invite_data.left += 1;
    await inviterDb.save();
    inviterData = inviterDb;
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
  cacheInvite,
};
