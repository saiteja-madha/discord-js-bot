const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticketcat",
  description: "manage ticket categories",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list",
        description: "list all ticket categories",
      },
      {
        trigger: "add <category> | <staff_roles>",
        description: "add a ticket category",
      },
      {
        trigger: "remove <category>",
        description: "remove a ticket category",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "list",
        description: "list all ticket categories",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "add a ticket category",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            description: "the category name",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "staff_roles",
            description: "the staff roles",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "remove a ticket category",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            description: "the category name",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {},

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    // list
    if (sub === "list") {
      const categories = data.settings.ticket.categories;
      if (categories?.length === 0) return interaction.followUp("No ticket categories found.");

      const fields = [];
      categories.forEach((c) => fields.push({ name: c.name, value: `Staff: ${c.staff_roles?.join(", ") || "-"}` }));
      const embed = new EmbedBuilder().setAuthor({ name: "Ticket Categories" }).addFields(fields);
      return interaction.followUp({ embeds: [embed] });
    }

    // add
    else if (sub === "add") {
      const categories = data.settings.ticket.categories;
      const category = interaction.options.getString("category");
      const staff_roles = interaction.options.getString("staff_roles");

      // check if category already exists
      if (categories.find((c) => c.name === category)) {
        return interaction.followUp(`Category ${category} already exists.`);
      }

      const staffRoles = (staff_roles?.split(",")?.map((r) => r.trim()) || []).filter((r) =>
        interaction.guild.roles.cache.has(r)
      );

      data.settings.ticket.categories.push({ name: category, staff_roles: staffRoles });
      await data.settings.save();

      return interaction.followUp(`Category ${category} added.`);
    }

    // remove
    else if (sub === "remove") {
      const categories = data.settings.ticket.categories;
      const category = interaction.options.getString("category");

      // check if category exists
      if (!categories.find((c) => c.name === category)) {
        return interaction.followUp(`Category ${category} does not exist.`);
      }

      data.settings.ticket.categories = categories.filter((c) => c.name !== category);
      await data.settings.save();

      return interaction.followUp(`Category ${category} removed.`);
    }

    //
    else interaction.followUp("Invalid subcommand.");
  },
};
