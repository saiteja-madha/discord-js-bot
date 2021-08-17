const { Command, CommandContext } = require("@root/structures");
const { maxLines } = require("@schemas/settings-schema");

module.exports = class MaxLines extends Command {
  constructor(client) {
    super(client, {
      name: "maxlines",
      description: "sets maximum lines allowed per message",
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

    if (parseInt(input) < 0) return ctx.reply("The maximum number of lines must be a positive integer!");

    await maxLines(guild.id, input)
      .then(() => {
        ctx.reply(
          `${
            input == 0
              ? "Maximum line limit is disabled"
              : "Messages longer than `" + input + "` lines will now be automatically deleted"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
