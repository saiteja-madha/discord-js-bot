const { Command, CommandContext } = require("@root/structures");
const { unmute } = require("@schemas/mute-schema");
const { canInteract } = require("@utils/modUtils");
const { getRoleByName } = require("@utils/guildUtils");

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "umutes the specified member(s)",
      usage: "<@member(s)> [reason]",
      minArgsCount: 1,
      category: "MODERATION",
      botPermissions: ["MANAGE_ROLES"],
      userPermissions: ["KICK_MEMBERS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, channel } = ctx;
    const { member } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return ctx.reply("No members mentioned");

    const mutedRole = getRoleByName(guild, "muted");
    if (!mutedRole.editable) {
      return ctx.reply("I do not have permission to move members to `Muted` role. Is that role below my highest role?");
    }

    mentions
      .filter((target) => canInteract(member, target, "unmute", channel))
      .forEach(async (target) => {
        const result = await unmute(guild.id, target.id);

        console.log(result);

        if (result.nModified === 1) {
          await target.roles.remove(mutedRole);
          ctx.reply(`${target.user.tag} is unmuted`);
        } else {
          ctx.reply(`${target.user.tag} is not muted`);
        }
      });
  }
};
