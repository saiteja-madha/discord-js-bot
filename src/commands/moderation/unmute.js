const { Command } = require("@src/structures");
const { canInteract, unmuteTarget } = require("@utils/modUtils");
const { getRoleByName, resolveMember } = require("@utils/guildUtils");
const { Message } = require("discord.js");

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "umutes the specified member(s)",
      command: {
        enabled: true,
        usage: "<@member(s)> [reason]",
        minArgsCount: 1,
        category: "MODERATION",
        botPermissions: ["MANAGE_ROLES"],
        userPermissions: ["KICK_MEMBERS"],
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { content } = message;
    const mentions = message.mentions.members;

    const mutedRole = getRoleByName(message.guild, "muted");
    if (!mutedRole.editable) {
      return message.reply(
        "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
      );
    }

    // !unmute ID <reason>
    if (mentions.size === 0) {
      const target = await resolveMember(message, args[0], true);
      if (!target) return message.reply(`No user found matching ${args[0]}`);
      const reason = content.split(args[0])[1].trim();
      return unmute(message, target, reason, mutedRole);
    }

    // !unmute @m1 @m2 ... <reason>
    const regex = /<@!?(\d+)>/g;
    const matches = content.match(regex);
    const lastMatch = matches[matches.length - 1];
    const reason = content.split(lastMatch)[1].trim();

    mentions.forEach(async (target) => await unmute(message, target, reason));
  }
};

async function unmute(message, target, reason) {
  if (!canInteract(message.member, target, "unmute", message.channel)) return;
  const status = await unmuteTarget(message.member, target, reason);
  if (status === "NOT_MUTED") return message.channel.send(`${target.user.tag} is not muted`);
  if (status) message.channel.send(`${target.user.tag} is unmuted`);
  else message.channel.send(`Failed to unmute ${target.user.tag}`);
}
