const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "uptime",
  description: "gives you bot uptime",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply(`My Uptime: \`${timeformat(process.uptime())}\``);
  },
};
