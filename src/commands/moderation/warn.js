const { resolveMember } = require("@root/src/utils/guildUtils");
const { Command } = require("@src/structures");
const { canInteract, addModAction } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class Warn extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      description: "warns the specified member(s)",
      command: {
        enabled: true,
        usage: "<ID|@member(s)> [reason]",
        minArgsCount: 1,
        category: "MODERATION",
        userPermissions: ["KICK_MEMBERS"],
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

    // !warn ID <reason>
    if (mentions.size === 0) {
      const target = await resolveMember(message, args[0], true);
      if (!target) return message.reply(`No user found matching ${args[0]}`);
      const reason = content.split(args[0])[1].trim();
      return warn(message, target, reason);
    }

    // !kick @m1 @m2 ... <reason>
    const regex = /<@!?(\d+)>/g;
    const matches = content.match(regex);
    const lastMatch = matches[matches.length - 1];
    const reason = content.split(lastMatch)[1].trim();

    mentions.forEach(async (target) => await warn(message, target, reason));
  }
};

async function warn(message, target, reason) {
  if (!canInteract(message.member, target, "warn", message.channel)) return;
  let status = await addModAction(message.member, target, reason, "WARN");
  if (status) message.channel.send(`${target.user.tag} is warned by ${message.author.tag}`);
  else message.channel.send(`Failed to warn ${target.user.tag}`);
}
