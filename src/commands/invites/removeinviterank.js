const { Command, CommandContext } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { getSettings, removeInviteRank } = require("@schemas/guild-schema");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reminviterank",
      description: "remove invite rank configured with that role",
      usage: "<role-name>",
      minArgsCount: 1,
      aliases: ["removeinviterank"],
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

    const role = message.mentions.roles.first() || findMatchingRoles(guild, query)[0];
    if (!role) return ctx.reply("No roles found matching `" + query + "`");

    const settings = await getSettings(guild);
    const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

    if (!exists) return ctx.reply("No previous invite rank is configured found for this role");
    await removeInviteRank(guild.id, role.id).then(ctx.reply("Success! Configuration saved."));
  }
};
