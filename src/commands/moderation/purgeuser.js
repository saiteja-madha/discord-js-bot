const { Message } = require("discord.js");
const { Command } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");
const { sendMessage } = require("@utils/botUtils");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class PurgeUser extends Command {
  constructor(client) {
    super(client, {
      name: "purgeuser",
      description: "deletes the specified amount of messages",
      category: "MODERATION",
      userPermissions: ["MANAGE_MESSAGES"],
      botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      command: {
        enabled: true,
        usage: "<@user|ID> [amount]",
        aliases: ["purgeusers"],
        minArgsCount: 1,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = await resolveMember(message, args[0]);
    if (!target) return message.reply(`No users found matching ${args[0]}`);
    const amount = (args.length > 1 && args[1]) || 99;

    if (amount) {
      if (isNaN(amount)) return message.reply("Numbers are only allowed");
      if (parseInt(amount) > 100) return message.reply("The max amount of messages that I can delete is 100");
    }

    const response = await purgeMessages(message.member, message.channel, "USER", amount, target);

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
