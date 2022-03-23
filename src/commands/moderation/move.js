const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const { resolveMember, getMatchingChannels } = require("@utils/guildUtils");
const move = require("./shared/move");

module.exports = class DeafenCommand extends Command {
  constructor(client) {
    super(client, {
      name: "move",
      description: "move specified member to voice channel",
      category: "MODERATION",
      userPermissions: ["DEAFEN_MEMBERS"],
      botPermissions: ["DEAFEN_MEMBERS"],
      command: {
        enabled: true,
        usage: "<ID|@member> <channel> [reason]",
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

    const channels = getMatchingChannels(message.guild, args[1]);
    if (!channels.length) return message.safeReply("No matching channels found");
    const targetChannel = channels.pop();
    if (!targetChannel.type === "GUILD_VOICE" && !targetChannel.type === "GUILD_STAGE_VOICE") {
      return message.safeReply("Target channel is not a voice channel");
    }

    const reason = args.slice(2).join(" ");
    const response = await move(message, target, reason, targetChannel);
    await message.safeReply(response);
  }
};
