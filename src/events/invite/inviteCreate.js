const { cacheInvite } = require("@src/handlers/invite");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Invite} invite
 */
module.exports = async (client, invite) => {
  const cachedInvites = client.inviteCache.get(invite?.guild.id);

  // Check if cache for the guild exists and then add it to cache
  if (cachedInvites) {
    cachedInvites.set(invite.code, cacheInvite(invite, false));
  }
};
