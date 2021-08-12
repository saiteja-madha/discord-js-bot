const { Command, CommandContext } = require("@root/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeToken extends Command {
  constructor(client) {
    super(client, {
      name: "purgetoken",
      description: "deletes the specified amount of messages containing the token",
      usage: "<amount> <token>",
      minArgsCount: 2,
      category: "MODERATION",
      clientPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    let amount = args[0] || 100;

    if (amount) {
      if (isNaN(amount)) return ctx.reply("Numbers are only allowed");
      if (parseInt(amount) > 100) return ctx.reply("The max amount of messages that I can delete is 100");
    }

    purgeMessages(message, "TOKEN", amount, args[1]);
  }
};
