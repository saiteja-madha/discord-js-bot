const { moveTarget } = require('@helpers/ModUtils')

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel)

  if (typeof response === 'boolean') {
    return `${target.user.tag} has been moved to ${channel.name}!`
  }
  if (response === 'MEMBER_PERM') {
    return `You do not have permission to move ${target.user.tag}!`
  }
  if (response === 'BOT_PERM') {
    return `I do not have permission to move ${target.user.tag}!`
  }
  if (response === 'NO_VOICE') {
    return `${target.user.tag} is not in a voice channel!`
  }
  if (response === 'SAME_CHANNEL') {
    return `${target.user.tag} is already in that channel!`
  }
  return `Failed to move ${target.user.tag}!`
}
