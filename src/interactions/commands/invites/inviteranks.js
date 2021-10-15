const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config");

module.exports = class InviteRanks extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "inviteranks",
      description: "view and configure invite ranks",
      enabled: true,
      category: "INVITE",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const settings = await getSettings(interaction.guild);

    if (settings.invite.ranks.length === 0) return interaction.followUp("No invite ranks configured in this server");
    let str = "";

    settings.invite.ranks.forEach((data) => {
      const roleName = interaction.guild.roles.cache.get(data._id)?.toString();
      if (roleName) {
        str += `${EMOJIS.ARROW} ${roleName}: ${data.invites} invites\n`;
      }
    });

    const embed = new MessageEmbed().setAuthor("Invite Ranks").setColor(EMBED_COLORS.BOT_EMBED).setDescription(str);
    return interaction.followUp({ embeds: [embed] });
  }
};
