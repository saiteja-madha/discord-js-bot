const { BotClient } = require("@src/structures");
const { counterHandler, inviteHandler } = require("@src/handlers");
const { loadReactionRoles } = require("@schemas/reactionrole-schema");
const { getSettings } = require("@schemas/guild-schema");

/**
 * @param {BotClient} client
 */
module.exports = async (client) => {
  client.logger.success(`Logged in as ${client.user.tag}! (${client.user.id})`);

  // Initialize Music Manager
  client.logger.log("Initializing music manager");
  client.musicManager.init(client.user.id);

  // Update Bot Presence
  updatePresence(client);
  setInterval(() => updatePresence(client), 10 * 60 * 1000);

  // Register global Interactions
  await client.registerGlobalInteractions();

  // Load reaction roles to cache
  await loadReactionRoles();

  // initialize counter Handler
  await counterHandler.init(client);

  client.guilds.cache.forEach(async (guild) => {
    // register guild commands
    client.registerGuildInteractions(guild);

    // cache invites for tracking enabled guilds
    const settings = await getSettings(guild);
    if (settings.invite.tracking) inviteHandler.cacheGuildInvites(guild);
  });
};

/**
 * @param {BotClient} client
 */
const updatePresence = (client) => {
  const guilds = client.guilds.cache;
  const members = guilds.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: `${members} members in ${guilds.size} servers`,
        type: "WATCHING",
      },
    ],
  });
};
