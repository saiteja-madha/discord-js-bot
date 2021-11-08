const { GuildMember, PartialGuildMember } = require("discord.js");
const { BotClient } = require("@src/structures");
const { inviteHandler, greetingHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {BotClient} client
 * @param {GuildMember|PartialGuildMember} member
 */
module.exports = async (client, member) => {
  if (member.partial) await member.user.fetch();
  if (!member.guild) return;

  const { guild } = member;
  const settings = await getSettings(guild);

  // Check for counter channel
  if (settings.counters.find((doc) => ["MEMBERS", "BOTS"].includes(doc.counter_type))) {
    if (member.user.bot) {
      settings.data.bots -= 1;
      await settings.save();
    }
    if (!client.counterUpdateQueue.includes(guild.id)) client.counterUpdateQueue.push(guild.id);
  }

  // Invite Tracker
  const inviterData = await inviteHandler.trackLeftMember(guild, member.user);

  // Farewell message
  greetingHandler.sendFarewell(member, inviterData);
};
