const { Command } = require("@src/structures");
const { unTimeoutTarget } = require("@utils/modUtils");
const { Message, CommandInteraction } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Timeout extends Command {
  constructor(client) {
    super(client, {
      name: "untimeout",
      description: "remove timeout from a member",
      category: "MODERATION",
      botPermissions: ["MODERATE_MEMBERS"],
      userPermissions: ["MODERATE_MEMBERS"],
      command: {
        enabled: true,
        aliases: ["unmute"],
        usage: "<ID|@member> [reason]",
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
    const reason = args.slice(1).join(" ").trim();
    const response = await untimeout(message.member, target, reason);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await untimeout(interaction.member, target, reason);
    await interaction.followUp(response);
  }
};

async function untimeout(issuer, target, reason) {
  const response = await unTimeoutTarget(issuer, target, reason);
  if (typeof response === "boolean") return `Timeout of ${target.user.tag} is removed!`;
  if (response === "BOT_PERM") return `I do not have permission to remove timeout of ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to remove timeout of ${target.user.tag}`;
  else if (response === "NO_TIMEOUT") return `${target.user.tag} is not timed out!`;
  else return `Failed to remove timeout of ${target.user.tag}`;
}
