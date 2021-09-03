const { MessageReaction, PartialMessageReaction, User } = require("discord.js");
const { reactionHandler } = require("@src/handlers");
const { BotClient } = require("@src/structures");

/**
 * @param {BotClient} client
 * @param {MessageReaction|PartialMessageReaction} reaction
 * @param {User} user
 */
module.exports = async (client, reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  const { message } = reaction;
  if (user.bot || message.webhookId || !message.content) return;

  const reactionRole = reactionHandler.getRole(reaction);
  if (reactionRole) {
    const member = await message.guild.members.fetch(user.id);
    if (!member) return;
    await member.roles.remove(reactionRole);
  }
};
