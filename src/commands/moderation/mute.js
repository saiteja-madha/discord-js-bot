const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { muteTarget } = require("@utils/modUtils");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "mutes the specified member",
      category: "MODERATION",
      botPermissions: ["MANAGE_ROLES"],
      userPermissions: ["MUTE_MEMBERS"],
      command: {
        enabled: true,
        usage: "<@member> [reason]",
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
            description: "reason for mute",
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
    if (!target) return message.reply(`No user found matching ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await mute(message.member, target, reason);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await mute(interaction.member, target, reason);
    await interaction.followUp(response);
  }
};

async function mute(issuer, target, reason) {
  const response = await muteTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.tag} is now muted!`;
  if (response === "BOT_PERM") return `I do not have permission to mute ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to mute ${target.user.tag}`;
  else if (response === "ALREADY_MUTED") return `${target.user.tag} is already muted on this server`;
  else if (response === "NO_MUTED_ROLE")
    return "There is no muted role in this server. Create a `Muted` role or use `mutesetup` to automatically create one";
  else if (response === "NO_MUTED_PERMISSION")
    return "I do not have permission to move members to `Muted` role. Is that role below my highest role?";
  else return `Failed to mute ${target.user.tag}`;
}
