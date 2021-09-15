const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class InviteCodes extends Command {
  constructor(client) {
    super(client, {
      name: "invitecodes",
      description: "list all your invites codes in this guild",
      command: {
        enabled: true,
        usage: "[@member|id]",
        category: "INVITE",
        botPermissions: ["EMBED_LINKS", "MANAGE_GUILD"],
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
    const target = (await resolveMember(message, args[0])) || message.member;

    const invites = await message.guild.invites.fetch({ cache: false });
    const reqInvites = invites.filter((inv) => inv.inviter.id === target.id);

    if (reqInvites.size === 0) return message.reply(`\`${target.user.tag}\` has no invites in this server`);

    let str = "";
    reqInvites.forEach((inv) => {
      str += `${EMOJIS.ARROW} [${inv.code}](${inv.url}) : ${inv.uses} uses\n`;
    });

    const embed = new MessageEmbed()
      .setAuthor(`Invite code for ${target.displayName}`)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(str);

    message.channel.send({ embeds: [embed] });
  }
};
