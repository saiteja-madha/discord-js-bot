const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { setTicketLogChannel, setTicketLimit } = require("@schemas/guild-schema");
const { canSendEmbeds } = require("@utils/guildUtils");
const { closeAllTickets, isTicketChannel, closeTicket } = require("@utils/ticketUtils");
const { createNewTicket } = require("@schemas/ticket-schema");

module.exports = class TicketCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
      enabled: true,
      category: "TICKET",
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "setup",
          description: "setup a new ticket message",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "the channel where ticket creation message must be sent",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "title",
              description: "the title for the ticket message",
              type: "STRING",
              required: true,
            },
            {
              name: "role",
              description: "the role's which can have access to newly opened tickets",
              type: "ROLE",
              required: false,
            },
          ],
        },
        {
          name: "log",
          description: "setup log channel for tickets",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel where ticket logs must be sent",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
          ],
        },
        {
          name: "limit",
          description: "set maximum number of concurrent open tickets",
          type: "SUB_COMMAND",
          options: [
            {
              name: "amount",
              description: "max number of tickets",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "close",
          description: "closes the ticket [used in ticket channel only]",
          type: "SUB_COMMAND",
        },
        {
          name: "closeall",
          description: "closes all open tickets",
          type: "SUB_COMMAND",
        },
        {
          name: "add",
          description: "add user to the current ticket channel [used in ticket channel only]",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user_id",
              description: "the id of the user to add",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "remove user from the ticket channel [used in ticket channel only]",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to remove",
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

    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");
      const title = interaction.options.getString("title");
      const role = interaction.options.getRole("role");

      try {
        const embed = new MessageEmbed()
          .setAuthor("Support Ticket")
          .setDescription(title)
          .setFooter("You can only have 1 open ticket at a time!");

        const row = new MessageActionRow().addComponents(new MessageButton().setCustomId("ticket").setStyle("PRIMARY"));
        const tktEmbed = await interaction.channel.send({ embeds: [embed], components: [row] });

        // save to Database
        await createNewTicket(interaction.guildId, channel.id, tktEmbed.id, title, role?.id);

        // send success
        await interaction.followUp("Configuration saved! Ticket message is now setup 🎉");
      } catch (ex) {
        await interaction.followUp("Unexpected error occurred! Setup has cancelled");
      }
    }

    // log channel
    else if (sub === "log") {
      const target = interaction.options.getChannel("channel");
      if (!canSendEmbeds(target)) {
        return interaction.followUp(`Oops! I do have have permission to send embed to ${target}`);
      }

      await setTicketLogChannel(interaction.guildId, target.id);
      await interaction.followUp(`Configuration saved! Newly created ticket logs will be sent to ${target.toString()}`);
    }

    // limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      if (Number.parseInt(limit, 10) < 5) return interaction.followUp("Ticket limit cannot be less than 5");
      await setTicketLimit(interaction.guildId, limit);
      return interaction.followUp(`Configuration saved. You can now have a maximum of \`${limit}\` open tickets`);
    }

    // close
    else if (sub === "close") {
      if (isTicketChannel(interaction.channel)) {
        const status = await closeTicket(interaction.channel, interaction.user, "Closed by a moderator");
        if (!status.success) await interaction.followUp(status.message);
      } else {
        await interaction.followUp("This command can only be used in ticket channels");
      }
    }

    // close all
    else if (sub === "closeall") {
      await interaction.followUp("Closing all open tickets, Please wait...");
      const stats = await closeAllTickets(interaction.guild);
      return interaction.editReply(`Completed! Success: \`${stats[0]}\` Failed: \`${stats[1]}\``);
    }

    // add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");

      if (!isTicketChannel(interaction.channel)) {
        return interaction.followUp("This command can only be used in ticket channel");
      }

      try {
        await interaction.channel.permissionOverwrites.create(inputId, {
          VIEW_CHANNEL: true,
          SEND_MESSAGES: true,
        });

        await interaction.followUp("Done");
      } catch (ex) {
        await interaction.followUp("Failed to add user. Did you provide a valid ID?");
      }
    }

    // remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      if (!isTicketChannel(interaction.channel)) {
        return interaction.followUp("This command can only be used in ticket channel");
      }

      try {
        interaction.channel.permissionOverwrites.create(user, {
          VIEW_CHANNEL: false,
          SEND_MESSAGES: false,
        });

        await interaction.followUp("Done");
      } catch (ex) {
        await interaction.followUp("Failed to remove user");
      }
    }
  }
};
