const { resolveMember } = require("@root/src/utils/guildUtils");
const { Command } = require("@src/structures");
const { canInteract, kickTarget } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      description: "kicks the specified member(s)",
      command: {
        enabled: true,
        usage: "<ID|@member(s)> [reason]",
        minArgsCount: 1,
        category: "MODERATION",
        botPermissions: ["KICK_MEMBERS"],
        userPermissions: ["KICK_MEMBERS"],
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
    const { content } = message;
    const mentions = message.mentions.members;

    // !kick ID <reason>
    if (mentions.size === 0) {
      const target = await resolveMember(message, args[0], true);
      if (!target) return message.reply(`No user found matching ${args[0]}`);
      const reason = content.split(args[0])[1].trim();
      return kick(message, target, reason);
    }

    // !kick @m1 @m2 ... <reason>
    const regex = /<@!?(\d+)>/g;
    const matches = content.match(regex);
    const lastMatch = matches[matches.length - 1];
    const reason = content.split(lastMatch)[1].trim();

    mentions.forEach(async (target) => await kick(message, target, reason));
  }
};

async function kick(message, target, reason) {
  if (!canInteract(message.member, target, "kick", message.channel)) return;
  let status = await kickTarget(message.member, target, reason);
  if (status) message.channel.send(`${target.user.tag} is kicked from this server`);
  else message.channel.send(`Failed to kick ${target.user.tag}`);
}
