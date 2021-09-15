const { Command } = require("@src/structures");
const { getEffectiveInvites, checkInviteRewards } = require("@src/handlers/invite-handler");
const { incrementInvites } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed, Message } = require("discord.js");
const { resolveMember } = require("@root/src/utils/guildUtils");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addinvites",
      description: "add invites to a member",
      command: {
        enabled: true,
        usage: "<@member|id> <invites>",
        minArgsCount: 2,
        category: "INVITE",
        botPermissions: ["EMBED_LINKS"],
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
    const target = await resolveMember(message, args[0], true);
    const amount = args[1];

    if (!target) return message.reply("Incorrect syntax. You must mention a target");
    if (isNaN(amount)) return message.reply("Invite amount must be a number");

    const inviteData = await incrementInvites(message.guildId, target.id, "ADDED", amount);

    const embed = new MessageEmbed()
      .setAuthor(`Added invites to ${target.user.username}`)
      .setThumbnail(target.user.displayAvatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`${target.user.tag} now has ${getEffectiveInvites(inviteData)} invites`);

    message.channel.send({ embeds: [embed] });
    checkInviteRewards(message.guild, inviteData, true);
  }
};
