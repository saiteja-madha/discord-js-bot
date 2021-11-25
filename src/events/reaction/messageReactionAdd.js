const { reactionHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");
const { getCountryFromFlag } = require("@utils/miscUtils");

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
