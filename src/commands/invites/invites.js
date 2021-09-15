const { Command } = require("@src/structures");
const { getEffectiveInvites } = require("@src/handlers/invite-handler");
const { getDetails } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed, Message } = require("discord.js");
const { resolveMember } = require("@root/src/utils/guildUtils");

module.exports = class InvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invites",
      description: "shows number of invites in this server",
      command: {
        enabled: true,
        usage: "[@member|id]",
        category: "INVITE",
        botPermissions: ["EMBED_LINKS"],
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

    const inviteData = await getDetails(message.guild.id, target.id);
    if (!inviteData) return message.reply(`No invite data found for \`${target.user.tag}\``);

    const embed = new MessageEmbed()
      .setAuthor(`Invites for ${target.displayName}`)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(target.user.displayAvatarURL())
      .setDescription(`${target.toString()} has ${getEffectiveInvites(inviteData)} invites`)
      .addField("Total Invites", `**${inviteData?.tracked_invites + inviteData?.added_invites || 0}**`, true)
      .addField("Fake Invites", `**${inviteData?.fake_invites || 0}**`, true)
      .addField("Left Invites", `**${inviteData?.left_invites || 0}**`, true);

    message.channel.send({ embeds: [embed] });
  }
};
