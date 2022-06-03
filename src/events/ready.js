const { counterHandler, inviteHandler } = require("@src/handlers");
const { cacheReactionRoles } = require("@schemas/Message");
const { getSettings } = require("@schemas/Guild");
const { updateCounterChannels } = require("@handlers/counter");

/**
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async (client) => {
  client.logger.success(`Logged in as ${client.user.tag}! (${client.user.id})`);

  // Initialize Music Manager
  if (client.config.ERELA_JS.ENABLED) {
    client.logger.log("Initializing music manager");
    client.erelaManager.init(client.user.id);
  }

  // Initialize Giveaways Manager
  if (client.config.GIVEAWAYS.ENABLED) {
    client.logger.log("Initializing giveaways manager");
    client.giveawaysManager._init();
  }

  // Update Bot Presence
  if (client.config.PRESENCE.ENABLED) {
    updatePresence(client);
    setInterval(() => updatePresence(client), 10 * 60 * 1000);
  }

  // Register Interactions
  if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
    if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions();
    else await client.registerInteractions(client.config.INTERACTIONS.TEST_GUILD_ID);
  }

  // Load reaction roles to cache
  await cacheReactionRoles(client);

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

  setInterval(() => updateCounterChannels(client), 10 * 60 * 1000);
};

/**
 * @param {import('@src/structures').BotClient} client
 */
const updatePresence = (client) => {
  let message = client.config.PRESENCE.MESSAGE;

  if (message.includes("{servers}")) {
    message = message.replaceAll("{servers}", client.guilds.cache.size);
  }

  if (message.includes("{members}")) {
    const members = client.guilds.cache.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);
    message = message.replaceAll("{members}", members);
  }

  client.user.setPresence({
    status: client.config.PRESENCE.STATUS,
    activities: [
      {
        name: message,
        type: client.config.PRESENCE.TYPE,
      },
    ],
  });
};
