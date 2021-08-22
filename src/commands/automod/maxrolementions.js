const { Command, CommandContext } = require("@src/structures");
const { maxRoleMentions } = require("@schemas/guild-schema");

module.exports = class MaxRoleMentions extends Command {
  constructor(client) {
    super(client, {
      name: "maxrolementions",
      description: "sets maximum role mentions allowed per message",
      usage: "<number>",
      minArgsCount: 1,
      category: "AUTOMOD",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild } = ctx;
    let input = args[0];

    if (isNaN(input)) {
      if (input === "none" || input === "off") input = 0;
      else return ctx.reply("Not a valid input");
    }

    if (parseInt(input) < 2) return ctx.reply("Maximum mentions must atleast be 2");

    await maxRoleMentions(guild.id, input)
      .then(() => {
        ctx.reply(
          `${
            input == 0
              ? "Maximum role mentions limit is disabled"
              : "Messages having more than `" + input + "` role mentions will now be automatically deleted"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
