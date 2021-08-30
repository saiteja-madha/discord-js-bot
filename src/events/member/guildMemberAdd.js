const { GuildMember } = require("discord.js");
const { BotClient } = require("@src/structures");
const { inviteHandler, greetingHandler } = require("@root/src/handlers");
const { getSettings, updateBotCount } = require("@schemas/counter-schema");

/**
 * @param {BotClient} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  if (!member || !member.guild) return;
  const { guild } = member;

  // Channel Counter
  const counterConfig = await getSettings(guild.id);
  if (counterConfig) {
    if (member.user.bot) await updateBotCount(guild.id, -1, true);
    if (!client.counterUpdateQueue.includes(guild.id)) client.counterUpdateQueue.push(guild.id);
  }

  // Track invites
  const inviterData = await inviteHandler.trackJoinedMember(member);

  // Send welcome message
  greetingHandler.sendWelcome(member, inviterData);
};
