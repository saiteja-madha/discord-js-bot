const { Message } = require("discord.js");
const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { sendMessage } = require("@utils/botUtils");

module.exports = class PurgeBots extends Command {
  constructor(client) {
    super(client, {
      name: "purgebots",
      description: "deletes the specified amount of messages from bots",
      category: "MODERATION",
      userPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      command: {
        enabled: true,
        usage: "[amount]",
        aliases: ["purgebot"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const amount = args[0] || 99;

    if (amount) {
      if (isNaN(amount)) return message.reply("Numbers are only allowed");
      if (parseInt(amount) > 99) return message.reply("The max amount of messages that I can delete is 99");
    }
    const response = await purgeMessages(message.member, message.channel, "BOT", amount);

    if (typeof response === "number") {
      return sendMessage(message.channel, `Successfully deleted ${response} messages`, 5);
    } else if (response === "BOT_PERM") {
      return message.reply("I don't have `Read Message History` & `Manage Messages` to delete messages");
    } else if (response === "MEMBER_PERM") {
      return message.reply("You don't have `Read Message History` & `Manage Messages` to delete messages");
    } else if (response === "NO_MESSAGES") {
      return message.reply("No messages found that can be cleaned");
    } else {
      return message.reply(`Error occurred! Failed to delete messages`);
    }
  }
};
