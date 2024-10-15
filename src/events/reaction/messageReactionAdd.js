const { reactionRoleHandler } = require('@src/handlers')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').MessageReaction|import('discord.js').PartialMessageReaction} reaction
 * @param {import('discord.js').User|import('discord.js').PartialUser} user
 */
module.exports = async (client, reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch()
    } catch (ex) {
      return // Failed to fetch message (maybe deleted)
    }
  }
  if (user.partial) await user.fetch()
  const { message } = reaction
  if (user.bot) return

  // Reaction Roles
  reactionRoleHandler.handleReactionAdd(reaction, user)

}
