const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const { EMBED_COLORS } = require("@root/config");

module.exports = class InviteRanks extends Command {
  constructor(client) {
    super(client, {
      name: "inviteranks",
      description: "shows the invite ranks configured on this guild",
      command: {
        enabled: true,
        category: "INVITE",
        botPermissions: ["EMBED_LINKS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const settings = await getSettings(message.guild);
    if (settings.invite.ranks.length === 0) return message.reply("No invite ranks configured in this server");
    let str = "";
    settings.invite.ranks.forEach((data) => {
      const roleName = message.guild.roles.cache.get(data._id)?.toString();
      if (roleName) {
        str += `${roleName}: ${data.invites} invites\n`;
      }
    });

    const embed = new MessageEmbed().setAuthor("Invite Ranks").setColor(EMBED_COLORS.BOT_EMBED).setDescription(str);

    message.channel.send({ embeds: [embed] });
  }
};
