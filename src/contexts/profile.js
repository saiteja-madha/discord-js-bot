const { BaseContext } = require("@src/structures");
const { ContextMenuInteraction } = require("discord.js");
const profile = require("@commands/information/shared/profile");

module.exports = class Profile extends BaseContext {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "get users profile",
      type: "USER",
      enabled: true,
      ephemeral: true,
    });
  }

  /**
   * @param {ContextMenuInteraction} interaction
   */
  async run(interaction) {
    const user = await interaction.client.users.fetch(interaction.targetId);
    const response = await profile(interaction, user);
    await interaction.followUp(response);
  }
};
