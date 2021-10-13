const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction, MessageActionRow, MessageButton } = require("discord.js");
const { BOT_INVITE, SUPPORT_SERVER, DASHBOARD, EMBED_COLORS } = require("@root/config.js");

module.exports = class BotInviteCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "invite",
      description: "looking for the bot's invite link?",
      enabled: true,
      ephemeral: true,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    // Embed
    const embed = new MessageEmbed()
      .setAuthor("Invite")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription(
        "Hey there! Thanks for considering to invite me\nUse the button below to navigate where you want"
      );

    // Buttons
    let components = [];
    components.push(
      new MessageButton().setLabel("Invite Link").setURL(BOT_INVITE).setStyle("LINK"),
      new MessageButton().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle("LINK")
    );

    if (DASHBOARD.enabled) {
      components.push(new MessageButton().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle("LINK"));
    }

    let buttonsRow = new MessageActionRow().addComponents(components);
    await interaction.followUp({ embeds: [embed], components: [buttonsRow] });
  }
};
