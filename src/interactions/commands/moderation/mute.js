const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { addModAction } = require("@utils/modUtils");

module.exports = class MuteCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "mutes the specified member",
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
          description: "reason for mute",
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

    const response = await addModAction(interaction.guild.me, target, reason, "MUTE");

    if (response === "NO_MUTED_ROLE") {
      return interaction.followUp(`Muted role doesn't exist! Create one or use /mutesetup to create one`);
    }

    if (response === "NO_MUTED_PERMISSION") {
      return interaction.followUp(
        "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
      );
    }

    if (response === "ALREADY_MUTED") {
      return interaction.followUp(`${target.user.tag} is already muted`);
    }

    await interaction.followUp(response);
  }
};
