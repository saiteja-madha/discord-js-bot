const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class PurgeLinks extends Command {
  constructor(client) {
    super(client, {
      name: "purgelinks",
      description: "deletes the specified amount of messages with links",
      command: {
        enabled: true,
        usage: "[amount]",
        aliases: ["purgelink"],
        category: "MODERATION",
        botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
        userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const amount = args[0] || 100;

    if (amount) {
      if (isNaN(amount)) return message.reply("Numbers are only allowed");
      if (parseInt(amount) > 100) return message.reply("The max amount of messages that I can delete is 100");
    }

    purgeMessages(message, "LINK", amount);
  }
};
