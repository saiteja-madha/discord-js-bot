const { vUnmuteTarget } = require("@utils/modUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.tag}'s voice is unmuted in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `You do not have permission to voice unmute ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return `I do not have permission to voice unmute ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} is not in any voice channel`;
  }
  if (response === "NOT_MUTED") {
    return `${target.user.tag} is not voice muted`;
  }
  return `Failed to voice unmute ${target.user.tag}`;
};
