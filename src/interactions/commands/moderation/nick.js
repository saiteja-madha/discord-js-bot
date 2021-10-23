const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { memberInteract } = require("@utils/modUtils");

module.exports = class Warnings extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "nick",
      description: "nickname commands",
      enabled: true,
      ephemeral: true,
      category: "MODERATION",
      userPermissions: ["MANAGE_NICKNAMES"],
      botPermissions: ["MANAGE_NICKNAMES"],
      options: [
        {
          name: "set",
          description: "change a members nickname",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the member whose nick you want to set",
              type: "USER",
              required: true,
            },
            {
              name: "name",
              description: "the nickname to set",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "reset",
          description: "reset a members nickname",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the members whose nick you want to reset",
              type: "USER",
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    if (!memberInteract(interaction.member, target)) {
      return interaction.followUp(`Oops! You cannot manage nickname of ${target.user.tag}`);
    }
    if (!memberInteract(interaction.guild.me, target)) {
      return interaction.followUp(`Oops! I cannot manage nickname of ${target.user.tag}`);
    }

    const name = interaction.options.getString("name");
    try {
      await target.setNickname(sub === "set" ? name : null);
      interaction.followUp(`Successfully ${sub === "set" ? "changed" : "reset"} nickname of ${target.user.tag}`);
    } catch (ex) {
      return interaction.followUp(`Failed to change nickname for ${target.displayName}. Did you provide a valid name?`);
    }
  }
};
