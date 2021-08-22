const { Command, CommandContext } = require("@src/structures");
const { clearInvites } = require("@schemas/invite-schema");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class ClearInvites extends Command {
  constructor(client) {
    super(client, {
      name: "clearinvites",
      description: "clear a users added invites",
      usage: "<@member>",
      minArgsCount: 1,
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const target = await resolveMember(message, args[0], true);
    if (!target) return ctx.reply(`Incorrect syntax. You must mention a target`);

    await clearInvites(message.guild.id, target.id).then(ctx.reply(`Done! Invites cleared for \`${target.user.tag}\``));
  }
};
