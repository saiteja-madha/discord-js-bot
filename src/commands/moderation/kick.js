const { Command, CommandContext } = require("@src/structures");
const { canInteract } = require("@utils/modUtils");

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      description: "kicks the specified member(s)",
      usage: "<@member(s)> [reason]",
      minArgsCount: 1,
      category: "MODERATION",
      botPermissions: ["KICK_MEMBERS"],
      userPermissions: ["KICK_MEMBERS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, channel } = ctx;
    const { member, content } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return ctx.reply("No members mentioned");

    const regex = /<@!?(\d+)>/g;
    let match = regex.exec(content);
    let lastMatch;
    while (match != null) {
      lastMatch = match[0];
      match = regex.exec(content);
    }

    const reason = content.split(lastMatch)[1].trim() || "No reason provided";

    mentions
      .filter((target) => canInteract(member, target, "kick", channel))
      .forEach(async (target) => {
        try {
          await target.kick(reason);
          ctx.reply(`${target.user.tag} is kicked from this server`);
        } catch (ex) {
          console.log(ex);
          return ctx.reply(`Failed to kick ${target.user.tag}`);
        }
      });
  }
};
