const { sendMessage } = require("@utils/botUtils");

/**
 * Emitted when a player queue ends.
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Player} player
 */
module.exports = (client, player) => {
  const channel = client.channels.cache.get(player.textChannel);
  sendMessage(channel, "Queue has ended.");
  player.destroy();
};
