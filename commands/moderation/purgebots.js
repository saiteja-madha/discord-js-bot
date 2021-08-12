const { Command, CommandContext } = require("@root/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeBots extends Command {
  constructor(client) {
    super(client, {
      name: "purgebots",
      description: "deletes the specified amount of messages from bots",
      usage: "[amount]",
      aliases: ["purgebot"],
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
    const { mentions } = message;
    let amount = args[0] || 100;

    if (!mentions.users.first()) return ctx.reply("Incorrect usage! No user mentioned");

    if (amount) {
      if (isNaN(amount)) return ctx.reply("Numbers are only allowed");
      if (parseInt(amount) > 100) return ctx.reply("The max amount of messages that I can delete is 100");
    }

    const target = mentions.users.first();
    purgeMessages(message, "BOT", amount);
  }
};
