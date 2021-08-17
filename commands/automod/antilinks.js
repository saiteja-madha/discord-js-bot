const { Command, CommandContext } = require("@root/structures");
const { antiLinks } = require("@schemas/settings-schema");

module.exports = class AntiLinks extends Command {
  constructor(client) {
    super(client, {
      name: "antilinks",
      description: "Allow or disallow sending links in message",
      usage: "<ON|OFF>",
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
    const input = args[0].toLowerCase();
    let status;

    if (input === "none" || input === "off" || input === "disable") status = false;
    else if (input === "on" || input === "enable") status = true;
    else return ctx.reply("Incorrect Command Usage");

    await antiLinks(guild.id, status)
      .then(() => {
        ctx.reply(
          `Messages ${status ? "with links will now be automatically deleted" : "will not be filtered for links now"}`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
