const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { unmuteTarget } = require("@utils/modUtils");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "umutes the specified member",
      botPermissions: ["MANAGE_ROLES"],
      userPermissions: ["MUTE_MEMBERS"],
      category: "MODERATION",
      command: {
        enabled: true,
        usage: "<@member> [reason]",
        minArgsCount: 1,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = await resolveMember(message, args[0], true);
    if (!target) return message.reply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await unmute(message.member, target, reason);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await unmute(interaction.member, target, reason);
    await interaction.followUp(response);
  }
};

async function unmute(issuer, target, reason) {
  const response = await unmuteTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.tag} is unmuted!`;
  if (response === "BOT_PERM") return `I do not have permission to unmute ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to unmute ${target.user.tag}`;
  else if (response === "NOT_MUTED") return `${target.user.tag} is not muted in this server`;
  else return `Failed to unmute ${target.user.tag}`;
}
