const { LavalinkManager } = require("lavalink-client");
const { MUSIC } = require("@root/config.js");

class MusicManager extends LavalinkManager {
  constructor(client) {
    super({
      nodes: MUSIC.LAVALINK_NODES,
      autoSkipOnResolveError: true,
      autoMove: true,
      autoSkip: true,
      sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
      emitNewSongsOnly: false,
      playerOptions: {
        defaultSearchPlatform: MUSIC.DEFAULT_SOURCE,
        onDisconnect: {
          autoReconnect: true,
          autoReconnectOnlyWithTracks: true,
          destroyPlayer: false,
        },
        queueOptions: {
          maxPreviousTracks: 30,
        },
      },
    });

    this.nodeManager.on("connect", (node) => {
      client.logger.success(`Lavalink node ${node.id} connected!`);
    });

    this.nodeManager.on("disconnect", (node, reason) => {
      client.logger.warn(`Lavalink node "${node.id}" disconnected. Reason: ${JSON.stringify(reason)}}`);
    });

    this.nodeManager.on("error", (node, error) => {
      client.logger.error(`Error occurred on Lavalink node "${node.id}": ${error.message}`);
    });

    this.nodeManager.on("destroy", (node) => {
      client.logger.warn(`Lavalink node "${node.id}" destroyed`);
    });
  }
}

module.exports = MusicManager;
