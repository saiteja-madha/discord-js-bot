const { Invite } = require("discord.js");
const { BotClient } = require("@src/structures");
const { inviteHandler } = require("@src/handlers");

/**
 * @param {BotClient} client
 * @param {Invite} invite
 */
module.exports = async (client, invite) => {
  await inviteHandler.cacheGuildInvites(invite?.guild);
};
