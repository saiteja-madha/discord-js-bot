const { ChannelType } = require('discord.js')

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (
  member,
  giveawayChannel,
  duration,
  prize,
  winners,
  host,
  allowedRoles = []
) => {
  try {
    if (!host) host = member.user

    // Check if the bot has "Add Reactions" permission
    if (
      !giveawayChannel.permissionsFor(member.client.user).has('AddReactions')
    ) {
      return `I do not have permission to add reactions in ${giveawayChannel}.`
    }

    if (!member.permissions.has('ManageMessages')) {
      return 'You need to have the manage messages permissions to start giveaways.'
    }

    if (
      !(
        giveawayChannel.type === ChannelType.GuildText ||
        giveawayChannel.type === ChannelType.GuildAnnouncement
      )
    ) {
      return 'You can only start giveaways in text or announcement channels.'
    }

    // Mention the allowed roles
    const mentionedRoles = allowedRoles.map(roleId => `<@&${roleId}>`).join(' ')

    // Send the message with the mentioned roles
    await giveawayChannel.send(`${mentionedRoles}`)

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: 'https://i.imgur.com/DJuTuxs.png',
      messages: {
        giveaway: '🎉 **GIVEAWAY** 🎉',
        giveawayEnded: '🎉 **GIVEAWAY ENDED** 🎉',
        inviteToParticipate: 'React with 🎁 to enter',
        dropMessage: 'Be the first to react with 🎁 to win!',
        hostedBy: `\nHosted by: ${host.username}`,
      },
    }

    if (allowedRoles.length > 0) {
      options.exemptMembers = member =>
        !member.roles.cache.find(role => allowedRoles.includes(role.id))
    }

    await member.client.giveawaysManager.start(giveawayChannel, options)

    return `Giveaway started in ${giveawayChannel}`
  } catch (error) {
    member.client.logger.error('Giveaway Start', error)
    return `An error occurred while starting the giveaway: ${error.message}`
  }
}
