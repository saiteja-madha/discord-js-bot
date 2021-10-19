const { BotClient } = require("@src/structures");

/**
 *
 * @param {BotClient} client
 * @param {import("erela.js").Node} node
 */
module.exports = (client, node) => {
  client.logger.log(`Node "${node.options.identifier}" connected`);
};
