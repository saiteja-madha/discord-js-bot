const { Command, CommandContext } = require("@root/structures");
const { antiInvites } = require("@schemas/automod-schema");

module.exports = class AntiInvites extends Command {
  constructor(client) {
    super(client, {
      name: "antiinvites",
      description: "Allow or disallow sending discord invites in message",
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

    await antiInvites(guild.id, status)
      .then(() => {
        ctx.reply(
          `Messages ${
            status
              ? "with discord invites will now be automatically deleted"
              : "will not be filtered for discord invites now"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
