const { Command, CommandContext } = require("@root/command");
const { xpSystem } = require("@schemas/settings-schema");

module.exports = class XPSystem extends Command {
  constructor(client) {
    super(client, {
      name: "xpsystem",
      description: "enable or disable XP ranking system in the server",
      usage: "<ON|OFF>",
      minArgsCount: 1,
      category: "ADMIN",
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

    xpSystem(guild.id, status)
      .then(() => {
        ctx.reply(`Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
