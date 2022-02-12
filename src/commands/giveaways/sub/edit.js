/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount) => {
  if (!messageId) return "You must provide a valid message id.";

  // Permissions
  if (!member.permissions.has("MANAGE_MESSAGES")) {
    return "You need to have the manage messages permissions to start giveaways.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `Unable to find a giveaway for messageId: ${messageId}`;

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: 60000 * addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return `Successfully updated the giveaway!`;
  } catch (error) {
    member.client.logger.error("Giveaway Edit", error);
    return `An error occurred while updating the giveaway: ${error.message}`;
  }
};
