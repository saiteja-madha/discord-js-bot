const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const evaluate = require("./sub/evaluate");

module.exports = class OwnerCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "owner",
      description: "owner commands",
      enabled: true,
      ephemeral: true,
      category: "OWNER",
      options: [
        {
          name: "eval",
          description: "evaluates an expression",
          type: "SUB_COMMAND",
          options: [
            {
              name: "expression",
              description: "expression to evaluate",
              type: "STRING",
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

    if (sub === "eval") {
      const input = interaction.options.getString("expression");
      const embed = evaluate(input);
      await interaction.followUp({ embeds: [embed] });
    }
  }
};
