const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { setPrefix } = require("@schemas/guild-schema");

module.exports = class SetPrefix extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "sets a new prefix for this server",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "prefix",
          description: "new prefix to set",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const newPrefix = interaction.options.getString("prefix");
    if (newPrefix.length > 2) return interaction.followUp("Prefix length cannot exceed `2` characters");

    await setPrefix(interaction.guildId, newPrefix);
    return interaction.followUp(`New prefix has been set to \`${newPrefix}\``);
  }
};
