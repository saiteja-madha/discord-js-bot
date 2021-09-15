const { Command } = require("@src/structures");
const { incrementInvites } = require("@schemas/invite-schema");
const { Message } = require("discord.js");

module.exports = class InvitesImportCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invitesimport",
      description: "add existing guild invites to users",
      command: {
        enabled: true,
        category: "INVITE",
        botPermissions: ["MANAGE_GUILD"],
        userPermissions: ["ADMINISTRATOR"],
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = message.mentions.members.first();
    const invites = await message.guild.invites.fetch({ cache: false });

    invites.forEach(async (invite) => {
      const user = invite.inviter;
      if (!user || invite.uses === 0) return; // console.log("No inviter");
      if (target && user.id !== target.id) return; // console.log("Skipping non user");
      await incrementInvites(message.guild.id, user.id, "ADDED", invite.uses);
    });

    message.reply(`Done! Previous invites added to ${target ? target.user.tag : "all members"}`);
  }
};
