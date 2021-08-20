const { Command, CommandContext } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { getSettings, addInviteRank, removeInviteRank } = require("@schemas/settings-schema");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addinviterank",
      description: "add auto-rank after reaching a particular number of invites",
      usage: "<role-name> <invites>",
      minArgsCount: 2,
      category: "INVITE",
      botPermissions: ["MANAGE_GUILD"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;

    const query = args[0];
    const invites = args[1];

    if (isNaN(invites)) return ctx.reply("`" + invites + "` is not a valid number of invites?");
    const role = message.mentions.roles.first() || findMatchingRoles(guild, query)[0];
    if (!role) return ctx.reply("No roles found matching `" + query + "`");

    const settings = await getSettings(guild.id);
    const exists = settings.invite.ranks.filter((obj) => obj.role_id === role.id);

    let msg = "";
    if (exists.length > 1) {
      await removeInviteRank(guild.id, role.id);
      msg += "Previous configuration found for this role. Overwriting data\n";
    }

    await addInviteRank(guild.id, role.id, invites).then(ctx.reply(msg + "Success! Configuration saved."));
  }
};
