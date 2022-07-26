const avatarInfo = require("../shared/avatar");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "avatar",
  description: "shows a users avatar information",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = avatarInfo(target.user);
    await message.safeReply(response);
  },
};
