const { BotClient } = require("@src/structures");
const { counterHandler, inviteHandler } = require("@src/handlers");
const { loadReactionRoles } = require("@schemas/reactionrole-schema");
const { getSettings } = require("@schemas/guild-schema");

/**
 * @param {BotClient} client
 */
module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);

  // Register Interactions
  if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions();
  else await client.registerInteractions(client.config.INTERACTIONS.TEST_GUILD_ID);

  // Load reaction roles to cache
  await loadReactionRoles();

  // initialize counter Handler
  await counterHandler.init(client);

  // cache invites for tracking enabled guilds
  client.guilds.cache.forEach(async (guild) => {
    const settings = await getSettings(guild);
    if (settings.invite.tracking) inviteHandler.cacheGuildInvites(guild);
  });
};
