const { Command, CommandContext } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeUser extends Command {
  constructor(client) {
    super(client, {
      name: "purgeuser",
      description: "deletes the specified amount of messages",
      usage: "<@user>",
      aliases: ["purgeusers"],
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
    const { mentions } = message;
    let amount = args[0] || 100;

    if (mentions.users.size == 0) return ctx.reply("Incorrect usage! No user mentioned");

    if (amount) {
      if (isNaN(amount)) return ctx.reply("Numbers are only allowed");
      if (parseInt(amount) > 100) return ctx.reply("The max amount of messages that I can delete is 100");
    }

    const targetIds = mentions.users.map((u) => u.id);
    purgeMessages(message, "USER", amount, targetIds);
  }
};
