require("dotenv").config();
require("module-alias/register");

const { ClusterClient, getInfo } = require("discord-hybrid-sharding");

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// initialize client with shard info from manager
const client = new BotClient({
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS,
});

// attach cluster client for cross-cluster utilities
client.cluster = new ClusterClient(client);

client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// shard lifecycle logs
client.on("shardReady", (id, unavailableGuilds) => {
  client.logger.success(`Shard ${id} ready${unavailableGuilds ? ` (${unavailableGuilds} unavailable)` : ""}`);
});
client.on("shardDisconnect", (event, id) => {
  client.logger.warn(`Shard ${id} disconnected (${event?.code || "unknown"})`);
});
client.on("shardReconnecting", (id) => client.logger.log(`Shard ${id} reconnecting...`));
client.on("shardResume", (id, replayed) => client.logger.success(`Shard ${id} resumed, replayed ${replayed} events`));
client.on("shardError", (error, id) => client.logger.error(`Shard ${id} error`, error));

// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

(async () => {
  // check for updates
  await checkForUpdates();

  // start the dashboard
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");

      // let the dashboard initialize the database
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // initialize the database
    await initializeMongoose();
  }

  // start the client
  await client.login(process.env.BOT_TOKEN);
})();
