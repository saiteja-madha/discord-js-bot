const { resolveMember } = require("@root/src/utils/guildUtils");
const { Command } = require("@src/structures");
const { canInteract, softbanTarget } = require("@utils/modUtils");
const { Message } = require("discord.js");

module.exports = class SoftBan extends Command {
  constructor(client) {
    super(client, {
      name: "softban",
      description: "softban the specified member(s). Kicks and deletes messages",
      command: {
        enabled: true,
        usage: "<ID|@member(s)> [reason]",
        minArgsCount: 1,
        category: "MODERATION",
        clientPermissions: ["BAN_MEMBERS"],
        userPermissions: ["BAN_MEMBERS"],
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

    // !softban ID <reason>
    if (mentions.size === 0) {
      const target = await resolveMember(message, args[0], true);
      if (!target) return message.reply(`No user found matching ${args[0]}`);
      const reason = content.split(args[0])[1].trim();
      return softban(message, target, reason);
    }

    // !softban @m1 @m2 ... <reason>
    const regex = /<@!?(\d+)>/g;
    const matches = content.match(regex);
    const lastMatch = matches[matches.length - 1];
    const reason = content.split(lastMatch)[1].trim();

    mentions.forEach(async (target) => await softban(message, target, reason));
  }
};

async function softban(message, target, reason) {
  if (!canInteract(message.member, target, "softban", message.channel)) return;
  const status = await softbanTarget(message.member, target, reason);
  if (status) message.channel.send(`${target.user.tag} is soft-banned from this server`);
  else message.channel.send(`Failed to softban ${target.user.tag}`);
}
