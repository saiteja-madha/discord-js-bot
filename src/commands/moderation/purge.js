const { Command, CommandContext } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      description: "deletes the specified amount of messages",
      usage: "<amount>",
      minArgsCount: 1,
      category: "MODERATION",
      botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const amount = args[0];

    if (isNaN(amount)) return ctx.reply("Numbers are only allowed");
    if (parseInt(amount) > 100) return ctx.reply("The max amount of messages that I can delete is 100");

    purgeMessages(message, "ALL", amount);
  }
};
