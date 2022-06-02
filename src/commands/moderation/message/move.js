const move = require("../shared/move");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "move",
  description: "move specified member to voice channel",
  category: "MODERATION",
  userPermissions: ["DEAFEN_MEMBERS"],
  botPermissions: ["DEAFEN_MEMBERS"],
  command: {
    enabled: true,
    usage: "<ID|@member> <channel> [reason]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);

    const channels = message.guild.findMatchingChannels(args[1]);
    if (!channels.length) return message.safeReply("No matching channels found");
    const targetChannel = channels.pop();
    if (!targetChannel.type === "GUILD_VOICE" && !targetChannel.type === "GUILD_STAGE_VOICE") {
      return message.safeReply("Target channel is not a voice channel");
    }

    const reason = args.slice(2).join(" ");
    const response = await move(message, target, reason, targetChannel);
    await message.safeReply(response);
  },
};
