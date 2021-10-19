const { BotClient } = require("@src/structures");

/**
 *
 * @param {BotClient} client
 * @param {import("erela.js").Player} player
 */
module.exports = (client, player) => {
  const channel = client.channels.cache.get(player.textChannel);
  channel.send("Queue has ended.");
  player.destroy();
};
