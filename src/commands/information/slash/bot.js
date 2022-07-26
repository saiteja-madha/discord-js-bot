const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { timeformat } = require("@helpers/Utils");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");
const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bot",
  description: "bot related commands",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "invite",
        description: "get bot's invite",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stats",
        description: "get bot's statistics",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "uptime",
        description: "get bot's uptime",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");

    // Invite
    if (sub === "invite") {
      const response = botInvite(interaction.client);
      try {
        await interaction.user.send(response);
        return interaction.followUp("Check your DM for my information! :envelope_with_arrow:");
      } catch (ex) {
        return interaction.followUp("I cannot send you my information! Is your DM open?");
      }
    }

    // Stats
    else if (sub === "stats") {
      const response = botstats(interaction.client);
      return interaction.followUp(response);
    }

    // Uptime
    else if (sub === "uptime") {
      await interaction.followUp(`My Uptime: \`${timeformat(process.uptime())}\``);
    }
  },
};

function botInvite(client) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("Hey there! Thanks for considering to invite me\nUse the button below to navigate where you want");

  // Buttons
  let components = [];
  components.push(new ButtonBuilder().setLabel("Invite Link").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
}
