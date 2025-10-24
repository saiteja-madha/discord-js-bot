require("dotenv").config();
require("module-alias/register");

const { ClusterManager } = require("discord-hybrid-sharding");
const path = require("path");
const Logger = require("@helpers/Logger");

const manager = new ClusterManager(path.join(__dirname, "bot.js"), {
  totalShards: "auto",
  shardsPerClusters: 2,
  mode: "process",
  token: process.env.BOT_TOKEN,
});

manager.on("clusterCreate", (cluster) => {
  // Basic lifecycle logs in unified format
  Logger.log(`[ClusterManager] Launched Cluster ${cluster.id}`);

  cluster.on("death", (p) => {
    Logger.warn(`[Cluster ${cluster.id}] process died with code ${p.exitCode}`);
  });

  cluster.on("message", (msg) => {
    if (typeof msg === "string") {
      Logger.log(`[Cluster ${cluster.id}] ${msg}`);
    }
  });
});

Logger.log("Spawning clusters...");
manager.spawn({ timeout: -1 });


