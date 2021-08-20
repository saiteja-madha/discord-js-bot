const { Command, CommandContext } = require("@src/structures");
const { getEffectiveInvites, checkInviteRewards } = require("@features/invite-tracker");
const { incrementInvites } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed } = require("discord.js");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addinvites",
      description: "add invites to a member",
      usage: "<@member> <invites>",
      minArgsCount: 2,
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild } = ctx;
    const target = message.mentions.members.first();
    const amount = ctx.args[1];

    if (!target) return ctx.reply(`Incorrect syntax. You must mention a target`);
    if (isNaN(amount)) return ctx.reply(`Invite amount must be a number`);

    const inviteData = await incrementInvites(guild.id, target.id, "ADDED", amount);

    const embed = new MessageEmbed()
      .setAuthor(`Added invites to ${target.user.username}`)
      .setThumbnail(target.user.displayAvatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`${target.user.tag} now has ${getEffectiveInvites(inviteData)} invites`);

    ctx.reply({ embeds: [embed] });
    checkInviteRewards(guild.id, inviteData, true);
  }
};
