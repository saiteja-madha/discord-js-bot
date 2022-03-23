const { MessageEmbed, Message, MessageActionRow, MessageButton, CommandInteraction } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");

// Schemas
const { createNewTicket } = require("@schemas/Message");

// Utils
const { parsePermissions } = require("@utils/botUtils");
const { canSendEmbeds, findMatchingRoles, getMatchingChannels } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@utils/ticketUtils");
const { isHex } = require("@utils/miscUtils");

const SETUP_TIMEOUT = 30 * 1000;

const SETUP_PERMS = ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"];

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
      category: "TICKET",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "setup",
            description: "start an interactive ticket setup",
          },
          {
            trigger: "log <#channel>",
            description: "setup log channel for tickets",
          },
          {
            trigger: "limit <number>",
            description: "set maximum number of concurrent open tickets",
          },
          {
            trigger: "close",
            description: "close the ticket",
          },
          {
            trigger: "closeall",
            description: "close all open tickets",
          },
          {
            trigger: "add <userId|roleId>",
            description: "add user/role to the ticket",
          },
          {
            trigger: "remove <userId|roleId>",
            description: "remove user/role from the ticket",
          },
        ],
      },
      slashCommand: {
        enabled: true,
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
                type: "INTEGER",
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
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.me.permissions.has("MANAGE_CHANNELS")) {
        return message.safeReply("I am missing `Manage Channels` to create ticket channels");
      }
      if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) {
        return message.safeReply("I am missing `Embed Links` permission to run an interactive setup");
      }
      return runInteractiveSetup(message);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2) return message.safeReply("Please provide a channel where ticket logs must be sent");
      const target = getMatchingChannels(message.guild, args[1]);
      if (target.length === 0) return message.safeReply("Could not find any matching channel");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Please provide a number");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Please provide a number input");
      response = await setupLimit(message, limit, data.settings);
    }

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply("Closing tickets ...");
      response = await closeAll(message);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2) return message.safeReply("Please provide a user or role to add to the ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply("Please provide a user or role to remove");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Invalid input
    else {
      return message.safeReply("Incorrect command usage");
    }

    if (response) await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");
      const title = interaction.options.getString("title");
      const role = interaction.options.getRole("role");
      const color = interaction.options.getString("color");

      if (!interaction.guild.me.permissions.has("MANAGE_CHANNELS")) {
        return interaction.followUp("I am missing `Manage Channels` to create ticket channels");
      }

      if (color && !isHex(color)) return interaction.followUp("Please provide a valid hex color");
      if (role && (role.managed || interaction.guild.me.roles.highest.position < role.position)) {
        return interaction.followUp("I do not have permissions to manage this role");
      }

      if (!canSendEmbeds(channel)) {
        return interaction.followUp(`I need do not have permissions to send embeds in ${channel}`);
      }

      response = await setupTicket(interaction.guild, channel, title, role, color);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      response = await setupLimit(interaction, limit, data.settings);
    }

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      response = await removeFromTicket(interaction, user.id);
    }

    if (response) await interaction.followUp(response);
  }
};

/**
 * @param {Message} message
 */
async function runInteractiveSetup({ channel, guild, author }) {
  const filter = (m) => m.author.id === author.id;

  const embed = new MessageEmbed()
    .setAuthor({ name: "Ticket Setup" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter({ text: "Type cancel to cancel setup" });

  let targetChannel;
  let title;
  let role;
  try {
    // wait for channel
    await channel.send({
      embeds: [embed.setDescription("Please `mention the channel` in which the ticket message must be sent")],
    });
    let reply = (await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT })).first();
    if (reply.content.toLowerCase() === "cancel") return reply.reply("Ticket setup has been cancelled");
    targetChannel = reply.mentions.channels.first();
    if (!targetChannel) return reply.reply("Ticket setup has been cancelled. You did not mention a channel");
    if (!targetChannel.isText() && !targetChannel.permissionsFor(guild.me).has(SETUP_PERMS)) {
      return reply.reply(
        `Ticket setup has been cancelled.\nI need ${parsePermissions(SETUP_PERMS)} in ${targetChannel}`
      );
    }

    // wait for title
    await channel.send({ embeds: [embed.setDescription("Please enter the `title` of the ticket")] });
    reply = (await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT })).first();
    if (reply.content.toLowerCase() === "cancel") return reply.reply("Ticket setup has been cancelled");
    title = reply.content;

    // wait for roles
    const desc =
      "What roles should have access to view the newly created tickets?\n" +
      "Please type the name of a existing role in this server.\n\n" +
      "Alternatively you can type `none`";

    await channel.send({ embeds: [embed.setDescription(desc)] });
    reply = (await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT })).first();
    const query = reply.content.toLowerCase();

    if (query === "cancel") return reply.reply("Ticket setup has been cancelled");
    if (query !== "none") {
      const roles = findMatchingRoles(guild, query);
      if (roles.length === 0) {
        return reply.reply(`Uh oh, I couldn't find any roles called ${query}! Ticket setup has been cancelled`);
      }
      role = roles[0];
      if (role.managed || guild.me.roles.highest.position < role.position) {
        return reply.reply("Ticket setup has been cancelled. I do not have permission to manage this role");
      }
      await reply.reply(`Alright! \`${role.name}\` can now view the newly created tickets`);
    }
  } catch (ex) {
    return channel.send("No answer for 30 seconds, setup has cancelled");
  }

  const response = await setupTicket(guild, targetChannel, title, role);
  return channel.send(response);
}

async function setupTicket(guild, channel, title, role, color) {
  try {
    const embed = new MessageEmbed()
      .setAuthor({ name: "Support Ticket" })
      .setDescription(title)
      .setFooter({ text: "You can only have 1 open ticket at a time!" });

    if (color) embed.setColor(color);

    const row = new MessageActionRow().addComponents(
      new MessageButton().setLabel("Open a ticket").setCustomId("TICKET_CREATE").setStyle("SUCCESS")
    );

    const tktMessage = await channel.send({ embeds: [embed], components: [row] });

    // save to Database
    await createNewTicket(guild.id, channel.id, tktMessage.id, title, role?.id);

    // send success
    return "Configuration saved! Ticket message is now setup 🎉";
  } catch (ex) {
    guild.client.logger.error("ticketSetup", ex);
    return "Unexpected error occurred! Setup failed";
  }
}

async function setupLogChannel(target, settings) {
  if (!canSendEmbeds(target)) return `Oops! I do have have permission to send embed to ${target}`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return `Configuration saved! Ticket logs will be sent to ${target.toString()}`;
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 5) return "Ticket limit cannot be less than 5";

  settings.ticket.limit = limit;
  await settings.save();

  return `Configuration saved. You can now have a maximum of \`${limit}\` open tickets`;
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel)) return "This command can only be used in ticket channels";
  const status = await closeTicket(channel, author, "Closed by a moderator");
  if (status === "MISSING_PERMISSIONS") return "I do not have permission to close tickets";
  if (status === "ERROR") return "An error occurred while closing the ticket";
  return null;
}

async function closeAll({ guild }) {
  const stats = await closeAllTickets(guild);
  return `Completed! Success: \`${stats[0]}\` Failed: \`${stats[1]}\``;
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "This command can only be used in ticket channel";
  if (!inputId || isNaN(inputId)) return "Oops! You need to input a valid userId/roleId";

  try {
    await channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    });

    return "Done";
  } catch (ex) {
    return "Failed to add user/role. Did you provide a valid ID?";
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "This command can only be used in ticket channel";
  if (!inputId || isNaN(inputId)) return "Oops! You need to input a valid userId/roleId";

  try {
    channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });
    return "Done";
  } catch (ex) {
    return "Failed to remove user/role. Did you provide a valid ID?";
  }
}
