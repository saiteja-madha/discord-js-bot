const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class UserInfo extends Command {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "shows information about the user",
      usage: "[@member|id]",
      aliases: ["uinfo", "memberinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const target = (await resolveMember(message, ctx.args[0])) || message.member;

    // color
    let color = message.member.displayHexColor;
    if (color == "#000000") color = EMBED_COLORS.BOT_EMBED;

    const embed = new MessageEmbed()
      .setAuthor(`User information for ${target.displayName}`, target.user.displayAvatarURL())
      .setThumbnail(target.user.displayAvatarURL())
      .setColor(color)
      .addField("User Tag", target.user.tag, true)
      .addField("ID", target.id, true)
      .addField("Guild Joined", target.joinedAt.toUTCString())
      .addField("Discord Registered", target.user.createdAt.toUTCString())
      .addField(`Roles [${target.roles.cache.size}]`, target.roles.cache.map((r) => r.name).join(", "), false)
      .addField("Avatar-URL", target.user.displayAvatarURL({ format: "png" }))
      .setFooter(`Requested by ${ctx.message.member.user.tag}`)
      .setTimestamp(Date.now());

    ctx.reply({ embeds: [embed] });
  }
};
