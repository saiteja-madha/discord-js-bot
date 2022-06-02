const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.tag} is deafened in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `You do not have permission to deafen ${target.user.tag}`;
  }
  if (response === "BOT_PERM") {
    return `I do not have permission to deafen ${target.user.tag}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.tag} is not in any voice channel`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `${target.user.tag} is already deafened`;
  }
  return `Failed to deafen ${target.user.tag}`;
};
