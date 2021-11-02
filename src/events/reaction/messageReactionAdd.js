const { MessageReaction, PartialMessageReaction, User, PartialUser } = require("discord.js");
const { BotClient } = require("@src/structures");
const { reactionHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/guild-schema");
const { getCountryFromFlag } = require("@utils/miscUtils");

/**
 * Emitted whenever a reaction is added to a cached message.
 * @param {BotClient} client
 * @param {MessageReaction|PartialMessageReaction} reaction
 * @param {User|PartialUser} user
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
  const reactionRole = reactionHandler.getRole(reaction);
  if (reactionRole) {
    const member = await message.guild.members.fetch(user.id);
    if (!member) return;
    await member.roles.add(reactionRole);
  }

  // Handle Reaction Emojis
  if (!emoji.id) {
    // Translation By Flags
    if (message.content && (await getSettings(message.guild)).flag_translation.enabled) {
      const countryCode = getCountryFromFlag(emoji.name);
      if (countryCode) reactionHandler.handleFlagReaction(countryCode, message, user);
    }
  }
};
