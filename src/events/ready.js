const { BotClient } = require("@src/structures");
const { counterHandler, inviteHandler, musicHandler } = require("@src/handlers");
const { loadReactionRoles } = require("@schemas/reactionrole-schema");
const { getSettings } = require("@schemas/Guild");

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

  // Register Interactions
  if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
    if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions();
    else await client.registerInteractions(client.config.INTERACTIONS.TEST_GUILD_ID);
  }

  // register player events
  musicHandler.registerPlayerEvents(client);

  // Load reaction roles to cache
  await loadReactionRoles();

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild);

    // initialize counter
    if (settings.counters.length > 0) {
      await counterHandler.init(guild, settings);
    }

    // cache invites
    if (settings.invite.tracking) {
      inviteHandler.cacheGuildInvites(guild);
    }
  }
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
