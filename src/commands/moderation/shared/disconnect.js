const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} is disconnected from the voice channel`;
  }
  if (response === "MEMBER_PERM") {
    return `You do not have permission to disconnect ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `I do not have permission to disconnect ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} is not in any voice channel`;
  }
  return `Failed to disconnect ${target.user.username}`;
};
