/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "You must provide a valid message id.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "You need to have the manage messages permissions to manage giveaways.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `Unable to find a giveaway for messageId: ${messageId}`;

  // Check if the giveaway is paused
  if (giveaway.pauseOptions.isPaused) return "This giveaway is already paused.";

  try {
    await giveaway.pause();
    return "Success! Giveaway paused!";
  } catch (error) {
    member.client.logger.error("Giveaway Pause", error);
    return `An error occurred while pausing the giveaway: ${error.message}`;
  }
};
