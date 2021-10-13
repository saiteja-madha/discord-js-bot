const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { setupMutedRole } = require("@utils/modUtils");
const { getRoleByName } = require("@utils/guildUtils");

module.exports = class MuteSetupCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "mutesetup",
      description: "setup muted role",
      enabled: true,
      category: "ADMIN",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    let mutedRole = getRoleByName(interaction.guild, "muted");
    if (mutedRole) return interaction.followUp("Muted role already exists");

    if (!interaction.guild.me.permissions.has("MANAGE_GUILD")) {
      return interaction.followUp("I need `Manage Guild` permission to create a new `Muted` role!");
    }

    mutedRole = await setupMutedRole(interaction.guild);

    if (!mutedRole) {
      return interaction.followUp(
        `Something went wrong while setting up. Please make sure I have permission to edit/create roles, and modify every channel.
          Alternatively, give me the \`Administrator\` permission for setting up`
      );
    }

    await interaction.followUp("Muted role is successfully setup");
  }
};
