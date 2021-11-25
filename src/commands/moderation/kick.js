const { Command } = require("@src/structures");
const { kickTarget } = require("@utils/modUtils");
const { Message, CommandInteraction } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      description: "kicks the specified member",
      category: "MODERATION",
      botPermissions: ["KICK_MEMBERS"],
      userPermissions: ["KICK_MEMBERS"],
      command: {
        enabled: true,
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
            description: "reason for kick",
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
    const response = await kick(message.member, target, reason);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await kick(interaction.member, target, reason);
    await interaction.followUp(response);
  }
};

async function kick(issuer, target, reason) {
  const response = await kickTarget(issuer, target, reason);
  if (typeof response === "boolean") return `${target.user.tag} is kicked!`;
  if (response === "BOT_PERM") return `I do not have permission to warn ${target.user.tag}`;
  else if (response === "MEMBER_PERM") return `You do not have permission to warn ${target.user.tag}`;
  else return `Failed to warn ${target.user.tag}`;
}
