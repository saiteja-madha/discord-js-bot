const { BotClient } = require("@src/structures");

/**
 * @param {BotClient} client
 */
function registerPlayerEvents(client) {
  client.player.on("error", (queue, error) => {
    client.logger.error(`[${queue.guild.name}] Error emitted from the queue`, error);
  });

  client.player.on("connectionError", (queue, error) => {
    client.logger.error(`[${queue.guild.name}] Error emitted from the connection`, error);
  });

  client.player.on("trackStart", (queue, track) => {
    queue.metadata.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
  });

  client.player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });

  client.player.on("botDisconnect", (queue) => {
    queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
  });

  client.player.on("channelEmpty", (queue) => {
    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
  });

  client.player.on("queueEnd", (queue) => {
    queue.metadata.send("✅ | Queue finished!");
  });
}

module.exports = {
  registerPlayerEvents,
};
