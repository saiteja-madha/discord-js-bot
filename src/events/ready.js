const { BotClient } = require("@src/structures");
const { counterHandler, inviteHandler } = require("@src/handlers");
const { loadReactionRoles } = require("@schemas/reactionrole-schema");

/**
 * @param {BotClient} client
 */
module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);

  const toRegister = [];
  client.commands
    .filter((cmd) => cmd.slashCommand.enabled)
    .forEach((cmd) => {
      let data = {
        name: cmd.name,
        description: cmd.description,
        type: "CHAT_INPUT",
        options: cmd.slashCommand.options,
      };
      toRegister.push(data);
    });

  // check if slash commands are enabled
  if (client.config.SLASH_COMMANDS.ENABLED) {
    if (client.config.SLASH_COMMANDS.GLOBAL) await client.registerSlashCommands();
    else await client.registerSlashCommands(client.config.SLASH_COMMANDS.TEST_GUILD_ID);
  }

  // Load reaction roles to cache
  await loadReactionRoles();

  // initialize counter Handler
  await counterHandler.init(client);

  // cache guild invites
  client.guilds.cache.forEach(async (guild) => inviteHandler.cacheGuildInvites(guild));
};
