const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class PurgeBots extends Command {
  constructor(client) {
    super(client, {
      name: "purgebots",
      description: "deletes the specified amount of messages from bots",
      command: {
        enabled: true,
        usage: "[amount]",
        aliases: ["purgebot"],
        category: "MODERATION",
        botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
        userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
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

    // const target = mentions.users.first();
    purgeMessages(message, "BOT", amount);
  }
};
