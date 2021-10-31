const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = class InviteCodes extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "invitecodes",
      description: "list all your invites codes in this guild",
      enabled: true,
      category: "INVITE",
      botPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "user",
          description: "the user to get the invite codes for",
          type: "USER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const invites = await interaction.guild.invites.fetch({ cache: false });
    const reqInvites = invites.filter((inv) => inv.inviter.id === user.id);

    if (reqInvites.size === 0) return interaction.followUp(`\`${user.tag}\` has no invites in this server`);

    let str = "";
    reqInvites.forEach((inv) => {
      str += `❯ [${inv.code}](${inv.url}) : ${inv.uses} uses\n`;
    });

    const embed = new MessageEmbed()
      .setAuthor(`Invite code for ${user.username}`)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(str);

    await interaction.followUp({ embeds: [embed] });
  }
};
