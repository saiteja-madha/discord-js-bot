const undeafen = require("../shared/undeafen");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "undeafen",
  description: "undeafen specified member in voice channels",
  category: "MODERATION",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await undeafen(message, target, reason);
    await message.safeReply(response);
  },
};
