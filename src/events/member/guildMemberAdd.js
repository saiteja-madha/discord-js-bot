const { inviteHandler, greetingHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (client, member) => {
  if (!member || !member.guild) return;

  const { guild } = member;
  const settings = await getSettings(guild);

  // Autorole
  if (settings.autorole) {
    const role = guild.roles.cache.get(settings.autorole);
    if (role) member.roles.add(role).catch((err) => {});
  }

  // Check for counter channel
  if (settings.counters.find((doc) => ["MEMBERS", "BOTS", "USERS"].includes(doc.counter_type.toUpperCase()))) {
    if (member.user.bot) {
      settings.data.bots += 1;
      await settings.save();
    }
    if (!client.counterUpdateQueue.includes(guild.id)) client.counterUpdateQueue.push(guild.id);
  }

  // Check if invite tracking is enabled
  const inviterData = settings.invite.tracking ? await inviteHandler.trackJoinedMember(member) : {};

  // Send welcome message
  greetingHandler.sendWelcome(member, inviterData);
};
