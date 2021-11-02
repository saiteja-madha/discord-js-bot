const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const { createNewTicket } = require("@schemas/ticket-schema");
const { canSendEmbeds } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, getTicketChannels, CLOSE_PERMS } = require("@utils/ticketUtils");
const { isHex } = require("@utils/miscUtils");

module.exports = class TicketCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
      enabled: true,
      ephemeral: true,
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
            {
              name: "color",
              description: "hex color for the ticket embed",
              type: "STRING",
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
    const settings = await getSettings(interaction.guild);

    if (sub === "setup") {
      if (!interaction.guild.me.permissions.has("MANAGE_CHANNELS")) {
        return interaction.followUp(
          `I need ${this.parsePermissions("MANAGE_CHANNELS")} to create new ticket channels}`
        );
      }

      const channel = interaction.options.getChannel("channel");
      const title = interaction.options.getString("title");
      const role = interaction.options.getRole("role");

      const color = interaction.options.getString("color");
      if (color && !isHex(color)) return interaction.followUp("Invalid Hex color");

      try {
        const embed = new MessageEmbed()
          .setAuthor("Support Ticket")
          .setDescription(title)
          .setFooter("You can only have 1 open ticket at a time!");

        const row = new MessageActionRow().addComponents(
          new MessageButton().setLabel("Open a ticket").setCustomId("TICKET_CREATE").setStyle("SUCCESS")
        );

        const perms = ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"];
        if (!channel.permissionsFor(interaction.client.user).has(perms)) {
          return interaction.followUp(`I need ${this.parsePermissions(perms)} in ${channel.toString()}`);
        }

        const tktEmbed = await channel.send({ embeds: [embed], components: [row] });

        // save to Database
        await createNewTicket(interaction.guildId, channel.id, tktEmbed.id, title, role?.id);

        // send success
        await interaction.followUp("Configuration saved! Ticket message is now setup 🎉");
      } catch (ex) {
        interaction.client.logger.error("ticketSetup", ex);
        await interaction.followUp("Unexpected error occurred! Setup failed");
      }
    }

    // log channel
    else if (sub === "log") {
      const target = interaction.options.getChannel("channel");
      if (!canSendEmbeds(target)) {
        return interaction.followUp(`Oops! I do have have permission to send embed to ${target}`);
      }

      settings.ticket.log_channel = target.id;
      await settings.save();

      return interaction.followUp(`Configuration saved! Ticket logs will be sent to ${target.toString()}`);
    }

    // limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      if (Number.parseInt(limit, 10) < 5) return interaction.followUp("Ticket limit cannot be less than 5");
      settings.ticket.limit = limit;
      await settings.save();
      return interaction.followUp(`Configuration saved. You can now have a maximum of \`${limit}\` open tickets`);
    }

    // close
    else if (sub === "close") {
      if (!isTicketChannel(interaction.channel)) {
        return interaction.followUp("This command can only be used in ticket channels");
      }
      const status = await closeTicket(interaction.channel, interaction.user, "Closed by a moderator");
      if (status === "MISSING_PERMISSIONS") {
        return interaction.followUp(`Missing ${CLOSE_PERMS} to close this ticket`);
      }
      if (status === "ERROR") {
        return interaction.followUp("Unexpected error occurred! Please try again later");
      }
    }

    // close all
    else if (sub === "closeall") {
      await interaction.followUp("Closing all open tickets, Please wait...");
      const channels = getTicketChannels(interaction.guild);
      let success = 0;
      let failed = 0;

      for (const channel of channels) {
        const status = await closeTicket(channel[1], interaction.user, "Closed by a moderator");
        if (status === "SUCCESS") success += 1;
        else failed += 1;
      }

      return interaction.editReply(`Completed! Success: \`${success}\` Failed: \`${failed}\``);
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
