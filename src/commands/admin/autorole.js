const { Command } = require("@src/structures");
const { getSettings } = require("@schemas/Guild");
const { Message, CommandInteraction } = require("discord.js");
const { findMatchingRoles } = require("@utils/guildUtils");

module.exports = class AutoRole extends Command {
  constructor(client) {
    super(client, {
      name: "autorole",
      description: "setup role to be given when a member joins the server",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        usage: "<role|off>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "add",
            description: "setup the autorole",
            type: "SUB_COMMAND",
            options: [
              {
                name: "role",
                description: "the role to be given",
                type: "ROLE",
                required: false,
              },
              {
                name: "role_id",
                description: "the role id to be given",
                type: "STRING",
                required: false,
              },
            ],
          },
          {
            name: "remove",
            description: "disable the autorole",
            type: "SUB_COMMAND",
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const input = args.join(" ");
    let response;

    if (input.toLowerCase() === "off") {
      response = await setAutoRole(message, null);
    } else {
      const roles = findMatchingRoles(message.guild, input);
      if (roles.length === 0) response = "No matching roles found matching your query";
      else response = await setAutoRole(message, roles[0]);
    }

    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // add
    if (sub === "add") {
      let role = interaction.options.getRole("role");
      if (!role) {
        const role_id = interaction.options.getString("role_id");
        if (!role_id) return interaction.followUp("Please provide a role or role id");

        const roles = findMatchingRoles(interaction.guild, role_id);
        if (roles.length === 0) return interaction.followUp("No matching roles found matching your query");
        role = roles[0];
      }

      response = await setAutoRole(interaction, role);
    }

    // remove
    else if (sub === "remove") {
      response = await setAutoRole(interaction, null);
    }

    // default
    else response = "Invalid subcommand";

    await interaction.followUp(response);
  }
};

async function setAutoRole({ guild }, role) {
  const settings = await getSettings(guild);

  if (role) {
    if (!guild.me.permissions.has("MANAGE_ROLES")) return "I don't have the `MANAGE_ROLES` permission";
    if (guild.me.roles.highest.position < role.position) return "I don't have the permissions to assign this role";
    if (role.managed) return "Oops! This role is managed by an integration";
  }

  if (!role) settings.autorole = null;
  else settings.autorole = role.id;

  await settings.save();
  return `Configuration saved! Autorole is ${!role ? "disabled" : "setup"}`;
}
