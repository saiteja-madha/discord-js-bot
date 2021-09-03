const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      description: "deletes the specified amount of messages",
      command: {
        enabled: true,
        usage: "<amount>",
        minArgsCount: 1,
        category: "MODERATION",
        botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
        userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const amount = args[0];

    if (isNaN(amount)) return message.reply("Numbers are only allowed");
    if (parseInt(amount) > 100) return message.reply("The max amount of messages that I can delete is 100");

    purgeMessages(message, "ALL", amount);
  }
};
