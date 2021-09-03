const { MessageReaction, PartialMessageReaction, User, PartialUser } = require("discord.js");
const { BotClient } = require("@src/structures");
const { reactionHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/guild-schema");

/**
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
  if (user.bot || !message.content) return;

  // Ticketing
  if (emoji.name === client.config.EMOJIS.TICKET_OPEN) await reactionHandler.handleNewTicket(reaction, user);
  if (emoji.name === client.config.EMOJIS.TICKET_CLOSE) await reactionHandler.handleCloseTicket(reaction, user);

  // Reaction Roles
  const reactionRole = reactionHandler.getRole(reaction);
  if (reactionRole) {
    const member = await message.guild.members.fetch(user.id);
    if (!member) return;
    await member.roles.add(reactionRole);
  }

  // Translation by flags
  if (emoji.name?.length === 4 && (await getSettings(message.guild)).flag_translation.enabled) {
    reactionHandler.handleFlagReaction(message, user);
  }
};
