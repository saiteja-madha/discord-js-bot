const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username}'s voice is muted in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `You do not have permission to voice mute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `I do not have permission to voice mute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} is not in any voice channel`;
  }
  if (response === "ALREADY_MUTED") {
    return `${target.user.username} is already muted`;
  }
  return `Failed to voice mute ${target.user.username}`;
};
