const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} is deafened in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `You do not have permission to deafen ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `I do not have permission to deafen ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} is not in any voice channel`;
  }
  if (response === "NOT_DEAFENED") {
    return `${target.user.username} is not deafened`;
  }
  return `Failed to deafen ${target.user.username}`;
};
