const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { addModAction } = require("@utils/modUtils");

module.exports = class BanCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "ban the specified member",
      enabled: true,
      category: "MODERATION",
      userPermissions: ["BAN_MEMBERS"],
      options: [
        {
          name: "user",
          description: "the target member",
          type: "USER",
          required: true,
        },
        {
          name: "reason",
          description: "reason for ban",
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

    const response = await addModAction(interaction.member, target, reason.length, "BAN");
    await interaction.followUp(response);
  }
};
