const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botstats",
  description: "shows bot information",
  category: "INFORMATION",
  botPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["botstat", "botinfo"],
  },

  async messageRun(message, args) {
    const response = botstats(message.client);
    await message.safeReply(response);
  },
};
