const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { getRoleByName } = require("@utils/guildUtils");
const { maxWarnings, maxWarnAction } = require("@schemas/guild-schema");

module.exports = class MaxWarn extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "maxwarn",
      description: "set max warnings configuration",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "limit",
          description: "set max warnings a member can receive before taking an action",
          type: "SUB_COMMAND",
          options: [
            {
              name: "amount",
              description: "max number of strikes",
              type: "INTEGER",
              required: true,
            },
          ],
        },
        {
          name: "action",
          description: "set action to performed after receiving maximum warnings",
          type: "SUB_COMMAND",
          options: [
            {
              name: "action",
              description: "action to perform",
              type: "STRING",
              required: true,
              choices: [
                {
                  name: "MUTE",
                  value: "MUTE",
                },
                {
                  name: "KICK",
                  value: "KICK",
                },
                {
                  name: "BAN",
                  value: "BAN",
                },
              ],
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
    if (!sub) return interaction.followUp("Not a valid subcommand");

    //
    if (sub === "limit") {
      let strikes = interaction.options.getInteger("amount");
      await maxWarnings(interaction.guildId, strikes);
      return interaction.followUp(`Configuration saved! Maximum warnings is set to ${strikes}`);
    }

    //
    else if (sub === "action") {
      let action = interaction.options.getString("action");
      if (action === "MUTE") {
        let mutedRole = getRoleByName(interaction.guild, "muted");
        if (!mutedRole) {
          return interaction.followUp(`Muted role doesn't exist in this guild`);
        }

        if (!mutedRole.editable) {
          return interaction.followUp(
            "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
          );
        }
      }

      await maxWarnAction(interaction.guildId, action);
      return interaction.followUp(`Configuration saved! Automod action is set to ${action}`);
    }
  }
};
