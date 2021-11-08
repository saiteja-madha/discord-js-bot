const { Command } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { getSettings, removeInviteRank } = require("@schemas/Guild");
const { Message } = require("discord.js");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reminviterank",
      description: "remove invite rank configured with that role",
      command: {
        enabled: true,
        usage: "<role-name>",
        minArgsCount: 1,
        aliases: ["removeinviterank"],
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
    const { guild } = message;
    const query = args[0];

    const role = message.mentions.roles.first() || findMatchingRoles(guild, query)[0];
    if (!role) return message.reply(`No roles found matching \`${query}\``);

    const settings = await getSettings(guild);
    const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

    if (!exists) return message.reply("No previous invite rank is configured found for this role");
    await removeInviteRank(guild.id, role.id);
    message.channel.send("Success! Configuration saved.");
  }
};
