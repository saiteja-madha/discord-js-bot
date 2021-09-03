const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class PurgeUser extends Command {
  constructor(client) {
    super(client, {
      name: "purgeuser",
      description: "deletes the specified amount of messages",
      command: {
        enabled: true,
        usage: "<@user>",
        aliases: ["purgeusers"],
        category: "MODERATION",
        clientPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
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
    const { mentions } = message;
    const amount = args[0] || 100;

    if (mentions.users.size == 0) return message.reply("Incorrect usage! No user mentioned");

    if (amount) {
      if (isNaN(amount)) return message.reply("Numbers are only allowed");
      if (parseInt(amount) > 100) return message.reply("The max amount of messages that I can delete is 100");
    }

    const targetIds = mentions.users.map((u) => u.id);
    purgeMessages(message, "USER", amount, targetIds);
  }
};
