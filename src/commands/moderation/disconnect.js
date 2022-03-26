const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");
const disconnect = require("./shared/disconnect");

module.exports = class DisconnectCommand extends Command {
  constructor(client) {
    super(client, {
      name: "disconnect",
      description: "disconnect specified member from voice channel",
      category: "MODERATION",
      userPermissions: ["MUTE_MEMBERS"],
      command: {
        enabled: true,
        usage: "<ID|@member> [reason]",
        minArgsCount: 1,
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
    const target = await resolveMember(message, args[0], true);
    if (!target) return message.safeReply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await disconnect(message, target, reason);
    await message.safeReply(response);
  }
};
