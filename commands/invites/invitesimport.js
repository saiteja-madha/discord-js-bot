const { Command, CommandContext } = require("@root/structures");
const { incrementInvites } = require("@schemas/invite-schema");

module.exports = class InvitesImportCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invitesimport",
      description: "add existing guild invites to users",
      category: "INVITE",
      botPermissions: ["MANAGE_GUILD"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const target = message.mentions.members.first();
    let invites = await message.channel.guild.fetchInvites();

    invites.forEach(async (invite) => {
      let user = invite.inviter;
      if (!user || invite.uses == 0) return console.log("No inviter");
      if (target && user.id !== target.id) return console.log("Skipping non user");
      await incrementInvites(message.channel.guild.id, user.id, "ADDED", invite.uses);
    });

    ctx.reply(`Done! Previous invites added to ${target ? target.user.tag : "all members"}`);
  }
};
