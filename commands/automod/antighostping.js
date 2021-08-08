const { Command, CommandContext } = require("@root/command");
const { antiGhostPing } = require("@schemas/automod-schema");

module.exports = class AntiGhostPing extends Command {
  constructor(client) {
    super(client, {
      name: "antighostping",
      description: "Log deleted messages with mentions (Requires `!automodlog` setup)",
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

    await antiGhostPing(guild.id, status)
      .then(() => {
        ctx.reply(`Anti-ghostping logging is now ${status ? "enabled" : "disabled"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
