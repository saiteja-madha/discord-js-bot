const { Command, CommandContext } = require("@root/structures");
const { maxMentions } = require("@schemas/automod-schema");

module.exports = class MaxMentions extends Command {
  constructor(client) {
    super(client, {
      name: "maxmentions",
      description: "sets maximum user mentions allowed per message",
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

    await maxMentions(guild.id, input)
      .then(() => {
        ctx.reply(
          `${
            input == 0
              ? "Maximum user mentions limit is disabled"
              : "Messages having more than `" + input + "` user mentions will now be automatically deleted"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
