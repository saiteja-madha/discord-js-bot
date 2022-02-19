/**
 * Emitted when a player queue ends.
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Player} player
 */
module.exports = (client, player) => {
  const channel = client.channels.cache.get(player.textChannel);
  player.destroy();
  channel.safeSend("Queue has ended.");
};
