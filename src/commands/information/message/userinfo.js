const { resolveMember } = require("@utils/guildUtils");
const userInfo = require("../shared/user");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "userinfo",
  description: "shows information about the user",
  category: "INFORMATION",
  botPermissions: ["EMBED_LINKS"],
  command: {
    enabled: true,
    usage: "[@member|id]",
    aliases: ["uinfo", "memberinfo"],
  },

  async messageRun(message, args) {
    const target = (args.length && (await resolveMember(message, args[0]))) || message.member;
    const response = userInfo(target);
    await message.safeReply(response);
  },
};
