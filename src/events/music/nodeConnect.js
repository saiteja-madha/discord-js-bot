/**
 * Emitted when a Node connects.
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Node} node
 */
module.exports = (client, node) => {
  client.logger.log(`Node "${node.options.identifier}" connected`);
};
