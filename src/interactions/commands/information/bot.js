const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { SlashCommand, BotClient } = require("@src/structures");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { timeformat } = require("@utils/miscUtils");
const botstats = require("./shared/botstats");

module.exports = class Info extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bot",
      description: "get various bot information",
      enabled: true,
      ephemeral: false,
      category: "INFORMATION",
      options: [
        {
          name: "invite",
          description: "get bot's invite",
          type: "SUB_COMMAND",
        },
        {
          name: "stats",
          description: "get bot's statistics",
          type: "SUB_COMMAND",
        },
        {
          name: "uptime",
          description: "get bot's uptime",
          type: "SUB_COMMAND",
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");
    let response;

    switch (sub) {
      case "invite":
        response = botInvite(interaction.client);
        break;

      case "stats":
        response = botstats(interaction.client);
        break;

      case "uptime":
        response = `My Uptime: \`${timeformat(process.uptime())}\``;
        break;

      default:
        return interaction.followUp("Incorrect subcommand");
    }

    await interaction.followUp(response);
  }
};

/**
 * @param {BotClient} client
 */
const botInvite = (client) => {
  const embed = new MessageEmbed()
    .setAuthor("Invite")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("Hey there! Thanks for considering to invite me\nUse the button below to navigate where you want");

  // Buttons
  let components = [];
  components.push(new MessageButton().setLabel("Invite Link").setURL(client.getInvite()).setStyle("LINK"));

  if (SUPPORT_SERVER) {
    components.push(new MessageButton().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle("LINK"));
  }

  if (DASHBOARD.enabled) {
    components.push(new MessageButton().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle("LINK"));
  }

  let buttonsRow = new MessageActionRow().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
};
