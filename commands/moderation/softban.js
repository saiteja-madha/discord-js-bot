const { Command, CommandContext } = require("@root/structures");
const { canInteract } = require("@utils/modUtils");

module.exports = class SoftBan extends Command {
  constructor(client) {
    super(client, {
      name: "softban",
      description: "softban the specified member(s). Kicks and deletes messages",
      usage: "<@member(s)> [reason]",
      minArgsCount: 1,
      category: "MODERATION",
      clientPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, channel } = ctx;
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
      .filter((target) => canInteract(member, target, "softban", channel))
      .forEach(async (target) => {
        try {
          await target.ban({
            days: 7,
            reason,
          });

          await guild.members.unban(target.user);
          ctx.reply(`${target.user.tag} is soft-banned from this server`);
        } catch (ex) {
          console.log(ex);
          return ctx.reply(`Failed to softban ${target.user.tag}`);
        }
      });
  }
};
