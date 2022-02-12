const { Command } = require("@src/structures");
const { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction } = require("discord.js");
const { timeformat } = require("@utils/miscUtils");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");
const botstats = require("./shared/botstats");

module.exports = class BotCommand extends Command {
  constructor(client) {
    super(client, {
      name: "bot",
      description: "bot related commands",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: false,
      },
      slashCommand: {
        enabled: true,
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
      },
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
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
  }
};

function botInvite(client) {
  const embed = new MessageEmbed()
    .setAuthor({ name: "Invite" })
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
}
