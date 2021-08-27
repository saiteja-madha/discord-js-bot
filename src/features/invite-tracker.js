const { getSettings } = require("@schemas/guild-schema");
const db = require("@schemas/invite-schema");
const { Client, Collection, Guild } = require("discord.js");
const { handleGreeting } = require("@features/greeting-handler");

const INVITE_CACHE = new Collection();

/**
 * @param {Client} client
 */
async function init(client) {
  client.guilds.cache.forEach(async (guild) => await cacheGuildInvites(guild));

  client.on("inviteCreate", async (invite) => await cacheGuildInvites(invite?.guild));

  client.on("inviteDelete", async (invite) => await cacheGuildInvites(invite?.guild));

  client.on("guildMemberAdd", async (member) => {
    if (member.partial) member = await member.fetch();
    if (member.user.bot || !member.guild) return;
    const { guild } = member;

    const settings = await getSettings(guild);
    if (!settings.invite.tracking) return;

    const cachedInvites = INVITE_CACHE.get(guild.id);
    const newInvites = await cacheGuildInvites(guild);
    const usedInvite = newInvites.find((inv) => cachedInvites.get(inv.code).uses < inv.uses);

    let inviterData = {};
    if (usedInvite) {
      const inviterId = usedInvite.code === guild.vanityURLCode ? "VANITY" : usedInvite.inviterId;
      await db.addInviter(guild.id, member.id, inviterId, usedInvite.code);
      inviterData = await db.incrementInvites(guild.id, inviterId, "TRACKED");
    }

    checkInviteRewards(guild, inviterData, true);
    handleGreeting(member, true, inviterData); // call greeting handler
  });

  client.on("guildMemberRemove", async (member) => {
    if (member.partial) member = await member.fetch();
    if (member.user.bot) return;
    const { guild } = member;

    const settings = await getSettings(guild);
    if (!settings.invite.tracking) return;
    let inviteData = (await db.getDetails(guild.id, member.id)) || {};

    let inviterData = {};
    if (inviteData.inviter_id) {
      const inviterId = inviteData.inviter_id === "VANITY" ? "VANITY" : inviteData.inviter_id;
      inviterData = await db.incrementInvites(guild.id, inviterId, "LEFT");
    }

    checkInviteRewards(guild, inviterData, false);
    handleGreeting(member, false, inviterData); // call greeting handler
  });
}

/**
 * @param {Guild} guild
 */
async function cacheGuildInvites(guild) {
  if (!guild || !(await getSettings(guild)).invite.tracking) return new Collection();
  let invites = await guild.invites.fetch();

  let tempMap = new Collection();
  invites.forEach((inv) => tempMap.set(inv.code, cacheInvite(inv)));
  if (guild.vanityURLCode) tempMap.set(guild.vanityURLCode, cacheInvite(await guild.fetchVanityData(), true));

  INVITE_CACHE.set(guild.id, tempMap);
  return tempMap;
}

/**
 * @param {Guild} guild
 * @param {Object} inviterData
 * @param {Boolean} isAdded
 */
async function checkInviteRewards(guild, inviterData = {}, isAdded) {
  const settings = await getSettings(guild);
  if (settings.invite.ranks.length > 0 && inviterData?.member_id) {
    let inviter = await guild.members.fetch(inviterData?.member_id).catch((ex) => {});
    if (!inviter) return;

    const invites = getEffectiveInvites(inviterData);
    settings.invite.ranks.forEach((reward) => {
      if (isAdded) {
        if (invites + 1 >= reward.invites && inviter.roles.cache.has(reward._id)) {
          inviter.roles.add(reward._id);
        }
      } else {
        if (invites - 1 < reward.invites && inviter.roles.cache.has(reward._id)) {
          inviter.roles.remove(reward._id);
        }
      }
    });
  }
}

/**
 * @param {Object} inviterData
 */
function getEffectiveInvites(inviterData) {
  return (
    inviterData?.tracked_invites + inviterData?.added_invites - inviterData?.fake_invites - inviterData?.left_invites ||
    0
  );
}

function cacheInvite(invite, isVanity) {
  return {
    code: invite.code,
    uses: invite.uses,
    inviterId: isVanity ? "VANITY" : invite.inviter?.id,
  };
}

module.exports = {
  init,
  getEffectiveInvites,
  checkInviteRewards,
  cacheGuildInvites,
};
