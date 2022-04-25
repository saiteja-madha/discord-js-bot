/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host) => {
  if (!host) host = member.user;
  if (!member.permissions.has("MANAGE_MESSAGES")) {
    return "You need to have the manage messages permissions to start giveaways.";
  }

  if (!giveawayChannel.isText()) {
    return "You can only start giveaways in text channels.";
  }

  try {
    await member.client.giveawaysManager.start(giveawayChannel, {
      duration: 60000 * duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://i.imgur.com/DJuTuxs.png",
      messages: {
        giveaway: "🎉 **GIVEAWAY** 🎉",
        giveawayEnded: "🎉 **GIVEAWAY ENDED** 🎉",
        inviteToParticipate: "React with 🎁 to enter",
        dropMessage: "Be the first to react with 🎁 to win!",
        hostedBy: `\nHosted by: ${host.tag}`,
      },
    });

    return `Giveaway started in ${giveawayChannel}`;
  } catch (error) {
    member.client.logger.error("Giveaway Start", error);
    return `An error occurred while starting the giveaway: ${error.message}`;
  }
};
