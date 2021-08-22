const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class InviteCodes extends Command {
  constructor(client) {
    super(client, {
      name: "invitecodes",
      description: "list all your invites codes in this guild",
      usage: "[@member|id]",
      category: "INVITE",
      botPermissions: ["EMBED_LINKS", "MANAGE_GUILD"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, args } = ctx;
    const target = (await resolveMember(message, args[0])) || message.member;

    let invites = await guild.invites.fetch({ cache: false });
    let reqInvites = invites.filter((inv) => inv.inviter.id === target.id);

    if (reqInvites.size == 0) return ctx.reply(`\`${target.user.tag}\` has no invites in this server`);

    let str = "";
    reqInvites.forEach((inv) => (str += `${EMOJIS.ARROW} [${inv.code}](${inv.url}) : ${inv.uses} uses\n`));

    const embed = new MessageEmbed()
      .setAuthor("Invite code for " + target.displayName)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(str);

    ctx.reply({ embeds: [embed] });
  }
};
