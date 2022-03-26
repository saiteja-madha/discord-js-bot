const { Command } = require("@src/structures");
const { timeoutTarget } = require("@utils/modUtils");
const { Message, CommandInteraction } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Timeout extends Command {
  constructor(client) {
    super(client, {
      name: "timeout",
      description: "timeouts the specified member",
      category: "MODERATION",
      botPermissions: ["MODERATE_MEMBERS"],
      userPermissions: ["MODERATE_MEMBERS"],
      command: {
        enabled: true,
        aliases: ["mute"],
        usage: "<ID|@member> <minutes> [reason]",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "the target member",
            type: "USER",
            required: true,
          },
          {
            name: "minutes",
            description: "the time to timeout the member for",
            type: "INTEGER",
            required: true,
          },
          {
            name: "reason",
            description: "reason for timeout",
            type: "STRING",
            required: false,
          },
        ],
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
    const minutes = parseInt(args[1]);
    if (isNaN(minutes)) return message.safeReply("Invalid time. Provide time in minutes.");
    const reason = args.slice(2).join(" ").trim();
    const response = await timeout(message.member, target, minutes, reason);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await timeout(interaction.member, target, minutes, reason);
    await interaction.followUp(response);
  }
};

async function timeout(issuer, target, minutes, reason) {
  const response = await timeoutTarget(issuer, target, minutes, reason);
  if (typeof response === "boolean") return `${target.user.tag} is timed out!`;
  if (response === "BOT_PERM") return `I do not have permission to timeout ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to timeout ${target.user.tag}`;
  else if (response === "ALREADY_TIMEOUT") return `${target.user.tag} is already timed out!`;
  else return `Failed to timeout ${target.user.tag}`;
}
