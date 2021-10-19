const { BotClient } = require("@src/structures");

/**
 *
 * @param {BotClient} client
 * @param {import("erela.js").Node} node
 * @param {Error} error
 */
module.exports = (client, node, error) => {
  client.logger.error(`Node "${node.options.identifier}" encountered an error: ${error.message}.`, error);
};
