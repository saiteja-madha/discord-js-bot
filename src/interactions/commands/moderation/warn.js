const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { addModAction } = require("@utils/modUtils");

module.exports = class Warn extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "warn",
      description: "warns the specified member",
      enabled: true,
      category: "MODERATION",
      options: [
        {
          name: "user",
          description: "the target member",
          type: "USER",
          required: true,
        },
        {
          name: "reason",
          description: "reason for warn",
          type: "STRING",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await addModAction(interaction.guild.me, target, reason, "WARN");
    await interaction.followUp(response);
  }
};
