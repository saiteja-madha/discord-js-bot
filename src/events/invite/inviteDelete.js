const { Invite } = require("discord.js");
const { BotClient } = require("@src/structures");

/**
 * Emitted when an invite is deleted.
 * @param {BotClient} client
 * @param {Invite} invite
 */
module.exports = async (client, invite) => {
  const cachedInvites = client.inviteCache.get(invite?.guild.id);

  // Check if invite code exists in the cache
  if (cachedInvites && cachedInvites.get(invite.code)) {
    cachedInvites.get(invite.code).deletedTimestamp = Date.now();
  }
};
