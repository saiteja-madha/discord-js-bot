const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgeuser",
  description: "deletes the specified amount of messages",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<@user|ID> [amount]",
    aliases: ["purgeusers"],
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0]);
    if (!target) return message.safeReply(`No users found matching ${args[0]}`);
    const amount = (args.length > 1 && args[1]) || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply("Numbers are only allowed");
      if (parseInt(amount) > 100) return message.safeReply("The max amount of messages that I can delete is 100");
    }

    const response = await purgeMessages(message.member, message.channel, "USER", amount, target);

    if (typeof response === "number") {
      return message.channel.safeSend(`Successfully deleted ${response} messages`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("I don't have `Read Message History` & `Manage Messages` to delete messages");
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("You don't have `Read Message History` & `Manage Messages` to delete messages");
    } else if (response === "NO_MESSAGES") {
      return message.safeReply("No messages found that can be cleaned");
    } else {
      return message.safeReply(`Error occurred! Failed to delete messages`);
    }
  },
};
