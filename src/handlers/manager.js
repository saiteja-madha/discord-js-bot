const { LavalinkManager } = require("lavalink-client");
const { MUSIC } = require("@root/config.js");

class Manager extends LavalinkManager {
  constructor(client) {
    super({
      nodes: MUSIC.LAVALINK_NODES,
      sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
      emitNewSongsOnly: false,
      queueOptions: {
        maxPreviousTracks: 30,
      },
      playerOptions: {
        defaultSearchPlatform: MUSIC.DEFAULT_SOURCE,
        onDisconnect: {
          autoReconnect: true,
          destroyPlayer: false,
        },
      },
      linksAllowed: true,
      linksBlacklist: ["porn"],
      linksWhitelist: [],
    });

    this.nodeManager.on("connect", (node) => {
      client.logger.success(`Lavalink node ${node.id} connected!`);
    });

    this.nodeManager.on("disconnect", (node, reason) => {
      client.logger.warn(`Lavalink node "${node.id}" disconnected. Reason: ${JSON.stringify(reason)}`);
    });

    this.nodeManager.on("error", (node, error) => {
      client.logger.error(`Error occurred on Lavalink node "${node.id}": ${error.message}`);
    });

    this.nodeManager.on("destroy", (node) => {
      client.logger.warn(`Lavalink node "${node.id}" destroyed`);
    });
  }
}

module.exports = Manager;
