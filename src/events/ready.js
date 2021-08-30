const { BotClient } = require("@src/structures");
const { counterHandler, inviteHandler } = require("@src/handlers");
const { loadReactionRoles } = require("@schemas/reactionrole-schema");
const { SlashCommandBuilder } = require("@discordjs/builders");

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

  const existing = await client.guilds.cache.get("691574650966376478").commands.fetch();
  // existing.forEach(async (app) => {
  //   console.log(app.name);
  //   await app.delete();
  //   console.log("Deleted");
  // });
  // const data = new SlashCommandBuilder()
  //   .setName("test2")
  //   .setDescription("Testing command")
  //   .addStringOption((option) => option.setName("string-arg").setDescription("string-arg").setRequired(false))
  //   .addIntegerOption((option) => option.setName("integer-arg").setDescription("integer-arg").setRequired(false));

  // const data2 = new SlashCommandBuilder()
  //   .setName("info")
  //   .setDescription("Get info about a user or a server!")
  //   .addSubcommand((subcommand) =>
  //     subcommand
  //       .setName("user")
  //       .setDescription("Info about a user")
  //       .addUserOption((option) => option.setName("target").setDescription("The user"))
  //   )
  //   .addSubcommand((subcommand) => subcommand.setName("server").setDescription("Info about the server"));

  // client.guilds.cache.get("691574650966376478").commands.create({
  //   name: "info",
  //   description: "get information command",
  //   type: "CHAT_INPUT",
  //   options: [
  //     {
  //       name: "guild",
  //       type: "SUB_COMMAND",
  //       description: "this is option 1",
  //       options: [
  //         {
  //           name: "id",
  //           description: "test sub description",
  //           type: "STRING",
  //         },
  //       ],
  //     },
  //     {
  //       name: "member",
  //       type: "SUB_COMMAND",
  //       description: "this is option 1",
  //       options: [
  //         {
  //           name: "id",
  //           description: "test sub description",
  //           type: "STRING",
  //         },
  //       ],
  //     },
  //   ],
  // });

  // client.guilds.cache.get("691574650966376478").commands.set(toRegister);
  // await client.application.commands.set(arrayOfSlashCommands);

  await client.registerSlashCommands();

  // Load reaction roles to cache
  await loadReactionRoles();

  // initialize counter Handler
  await counterHandler.init(client);

  // cache guild invites
  client.guilds.cache.forEach(async (guild) => inviteHandler.cacheGuildInvites(guild));
};
