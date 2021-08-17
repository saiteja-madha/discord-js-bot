const { Command, CommandContext } = require("@root/structures");
const { inviteTracking } = require("@schemas/settings-schema");

module.exports = class InviteTracker extends Command {
  constructor(client) {
    super(client, {
      name: "invitetracker",
      description: "enable or disable invite tracking in the server",
      usage: "<ON|OFF>",
      minArgsCount: 1,
      category: "INVITE",
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

    inviteTracking(guild.id, status)
      .then(() => {
        ctx.reply(`Configuration saved! Invite tracking is now ${status ? "enabled" : "disabled"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
