const { BaseContext } = require("@src/structures");
const { ContextMenuInteraction } = require("discord.js");
const avatar = require("@commands/information/shared/avatar");

module.exports = class Avatar extends BaseContext {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "displays avatar information about the user",
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
    const response = avatar(user);
    await interaction.followUp(response);
  }
};
