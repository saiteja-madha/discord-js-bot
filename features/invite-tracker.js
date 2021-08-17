const { getSettings } = require("@schemas/settings-schema");
const db = require("@schemas/invite-schema");
const { Client, Collection, Guild } = require("discord.js");

const INVITE_CACHE = new Collection();

/**
 * @param {Client} client
 */
async function run(client) {
  client.guilds.cache.forEach(async (guild) => await cacheGuildInvites(guild));

  client.on("inviteCreate", async (invite) => await cacheGuildInvites(invite?.guild));

  client.on("inviteDelete", async (invite) => await cacheGuildInvites(invite?.guild));

  client.on("guildMemberAdd", async (member) => {
    if (member.partial) member = await member.fetch();
    if (member.user.bot || !member.guild) return;
    const { guild } = member;

    const cachedInvites = INVITE_CACHE.get(guild.id);
    const newInvites = await cacheGuildInvites(guild);
    const usedInvite = newInvites.find((inv) => cachedInvites.get(inv.code).uses < inv.uses);

    // could not track who invited this user 😟
    if (!usedInvite) {
      return;
    }

    // Joined using Vanity URL
    if (usedInvite.code === guild.vanityURLCode) {
      return await db.addInviter(guild.id, member.id, "VANITY");
    }

    await db.addInviter(guild.id, member.id, usedInvite.inviter.id, usedInvite.code);
    const inviterData = await db.incrementInvites(guild.id, usedInvite.inviter.id, "TRACKED");

    checkInviteRewards(guild, inviterData, true);
  });

  client.on("guildMemberRemove", async (member) => {
    if (member.partial) member = await member.fetch();
    if (member.user.bot) return;
    const { guild } = member;

    let inviteData = await db.getDetails(guild.id, member.id);
    if (!inviteData || !inviteData?.inviter_id) {
      console.log(`${member.user.tag} left the server but I do not know who invited them.`);
      return;
    }

    if (inviteData.inviter_id === "VANITY") {
      console.log(`${member.user.tag} left the server. They joined using the server vanity URL.`);
      return;
    }

    const inviterData = await db.incrementInvites(guild.id, inviteData.inviter_id, "LEFT");
    checkInviteRewards(guild, inviterData, false);
  });
}

/**
 * @param {Guild} guild
 */
async function shouldInvitesBeTracked(guild) {
  const settings = await getSettings(guild.id);
  return settings.invite.tracking && guild.me.permissions.has("MANAGE_GUILD");
}

/**
 * @param {Guild} guild
 */
async function cacheGuildInvites(guild) {
  if (!guild || !(await shouldInvitesBeTracked(guild))) return new Collection();
  let invites = await guild.invites.fetch({ cache: false });
  if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
  INVITE_CACHE.set(guild.id, invites);
  return invites;
}

/**
 * @param {Guild} guild
 * @param {Object} inviterData
 * @param {Boolean} isAdded
 */
async function checkInviteRewards(guild, inviterData, isAdded) {
  const settings = await getSettings(guild.id);
  if (settings.invite.ranks.length > 0 && inviterData?.inviter_id) {
    let inviter = await guild.members.fetch(inviterData?.inviter_id).catch((ex) => {});
    if (!inviter) return;

    const invites = getEffectiveInvites(inviterData);
    settings.invite.ranks.forEach((reward) => {
      if (isAdded) {
        if (invites + 1 >= reward.invites && inviter.roles.cache.has(reward.role_id)) {
          inviter.roles.add(reward.role_id);
        }
      } else {
        if (invites - 1 < reward.invites && inviter.roles.cache.has(reward.role_id)) {
          inviter.roles.remove(reward.roleID);
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

module.exports = {
  run,
  getEffectiveInvites,
  checkInviteRewards,
};
