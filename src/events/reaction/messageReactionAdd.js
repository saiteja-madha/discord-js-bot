const { translationHandler, reactionRoleHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");
const { isValidEmoji } = require("country-emoji-languages");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').MessageReaction|import('discord.js').PartialMessageReaction} reaction
 * @param {import('discord.js').User|import('discord.js').PartialUser} user
 */
module.exports = async (client, reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (ex) {
      return; // Failed to fetch message (maybe deleted)
    }
  }
  if (user.partial) await user.fetch();
  const { message, emoji } = reaction;
  if (user.bot) return;

  // Reaction Roles
  reactionRoleHandler.handleReactionAdd(reaction, user);

  // Handle Reaction Emojis
  if (!emoji.id) {
    // Translation By Flags
    if (message.content && (await getSettings(message.guild)).flag_translation.enabled) {
      if (isValidEmoji(emoji.name)) {
        translationHandler.handleFlagReaction(emoji.name, message, user);
      }
    }
  }
};
