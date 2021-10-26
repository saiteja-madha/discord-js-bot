const { GuildMember } = require("discord.js");
const { BotClient } = require("@src/structures");
const { inviteHandler, greetingHandler } = require("@root/src/handlers");
const { getConfig, updateBotCount } = require("@schemas/counter-schema");
const { getSettings } = require("@root/src/schemas/guild-schema");

/**
 * Emitted whenever a user joins a guild.
 * @param {BotClient} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  if (!member || !member.guild) return;
  const { guild } = member;

  // Channel Counter
  const counterConfig = await getConfig(guild.id);
  if (counterConfig) {
    if (member.user.bot) await updateBotCount(guild.id, -1, true);
    if (!client.counterUpdateQueue.includes(guild.id)) client.counterUpdateQueue.push(guild.id);
  }

  // Check if invite tracking is enabled
  const settings = await getSettings(guild);
  const inviterData = settings.invite.tracking ? await inviteHandler.trackJoinedMember(member) : {};

  // Send welcome message
  greetingHandler.sendWelcome(member, inviterData);
};
