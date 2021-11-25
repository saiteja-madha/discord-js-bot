/**
 * Emitted when a Node reconnects.
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Node} node
 */
module.exports = (client, node) => {
  client.logger.warn(`Node "${node.options.identifier}" is reconnecting`);
};