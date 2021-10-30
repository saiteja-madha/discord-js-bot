const { Command } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { getSettings, addInviteRank, removeInviteRank } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addinviterank",
      description: "add auto-rank after reaching a particular number of invites",
      command: {
        enabled: true,
        usage: "<role-name> <invites>",
        minArgsCount: 2,
        category: "INVITE",
        botPermissions: ["MANAGE_GUILD"],
        userPermissions: ["ADMINISTRATOR"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const query = args[0];
    const invites = args[1];

    if (isNaN(invites)) return message.reply(`\`${invites}\` is not a valid number of invites?`);
    const role = message.mentions.roles.first() || findMatchingRoles(message.guild, query)[0];
    if (!role) return message.reply(`No roles found matching \`${query}\``);

    const settings = await getSettings(message.guild);
    const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

    let msg = "";
    if (exists) {
      await removeInviteRank(message.guild.id, role.id);
      msg += "Previous configuration found for this role. Overwriting data\n";
    }

    await addInviteRank(message.guild.id, role.id, invites);
    message.channel.send(`${msg}Success! Configuration saved.`);
  }
};
