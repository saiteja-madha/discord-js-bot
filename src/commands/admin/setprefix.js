const { Command, CommandContext } = require("@src/structures");
const { setPrefix } = require("@schemas/guild-schema");

module.exports = class SetPrefix extends Command {
  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "sets a new prefix for this server",
      usage: "<new-prefix>",
      minArgsCount: 1,
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild, message } = ctx;
    const newPrefix = args[0];

    if (newPrefix.length > 2) return message.reply("Prefix length cannot exceed `2` characters");

    await setPrefix(guild.id, newPrefix)
      .then(() => {
        ctx.reply(`New prefix has been set to \`${newPrefix}\``);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
