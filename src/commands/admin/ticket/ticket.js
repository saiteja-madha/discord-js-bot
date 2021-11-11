const { MessageEmbed, Message } = require("discord.js");
const { Command } = require("@src/structures");
const { sendMessage } = require("@utils/botUtils");
const { canSendEmbeds, findMatchingRoles, getMatchingChannel } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets, PERMS } = require("@utils/ticketUtils");
const { getSettings } = require("@schemas/Guild");
const { createNewTicket } = require("@schemas/Message");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");

const SETUP_TIMEOUT = 30 * 1000;

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
      category: "ADMIN",
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
        category: "TICKET",
        userPermissions: ["ADMINISTRATOR"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const input = args[0].toLowerCase();
    let response;

    if (input === "setup") {
      return await setupTicket(message);
    }

    //
    else if (input === "log") {
      if (args.length < 2) return message.reply("Please provide a channel where ticket logs must be sent");
      const target = getMatchingChannel(message.guild, args[1]);
      if (target.length === 0) return message.reply("Could not find any matching channel");
      response = await setupLogChannel(message);
    }

    //
    else if (input === "limit") {
      if (args.length < 2) return message.reply("Please provide a number");
      const limit = args[1];
      if (isNaN(limit)) return message.reply("Please provide a number input");
      response = await setupLimit(message, limit);
    }

    //
    else if (input === "close") {
      response = await close(message);
    }

    //
    else if (input === "closeall") {
      await message.reply("Closing tickets ...");
      response = await closeAll(message);
      return message.editable ? message.edit(response) : message.channel.send(response);
    }

    //
    else if (input === "add") {
      if (args.length < 2) return message.reply("Please provide a user or role to add to the ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    //
    else if (input === "remove") {
      if (args.length < 2) return message.reply("Please provide a user or role to remove");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    await message.reply(response);
  }
};

/**
 * @param {Message} message
 */
async function setupTicket(message) {
  const { channel, guild } = message;
  const filter = (m) => m.author.id === message.author.id;
  const embed = new MessageEmbed()
    .setAuthor("Ticket Setup")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter("Type cancel to cancel setup");

  let targetChannel;
  let title;
  let role;
  try {
    // wait for channel
    await message.reply({
      embeds: [embed.setDescription("Please `mention the channel` in which the reaction message must be sent")],
    });
    let reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    if (reply.first().content === "cancel") return message.reply("Ticket setup has been cancelled");
    targetChannel = reply.first().mentions.channels.first();
    if (!targetChannel) return message.reply("Ticket setup has been cancelled. You did not mention a channel");
    if (!targetChannel.isText() && !targetChannel.permissionsFor(guild.me).has(PERMS))
      return message.reply(
        `Ticket setup has been cancelled. I do not have permission to send embed to ${targetChannel.toString()}`
      );

    // wait for title
    await message.reply({ embeds: [embed.setDescription("Please enter the `title` of the ticket")] });
    reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    if (reply.first().content === "cancel") return message.reply("Ticket setup has been cancelled");
    title = reply.first().content;

    // wait for roles
    const desc =
      "What roles should have access to view the newly created tickets?\n" +
      "Please type the name of a existing role in this server.\n\n" +
      "Alternatively you can type `none`";
    await message.reply({ embeds: [embed.setDescription(desc)] });
    reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    const search = reply.first().content;
    if (search === "cancel") return message.reply("Ticket setup has been cancelled");
    if (search.toLowerCase() !== "none") {
      [role] = findMatchingRoles(guild, search);
      if (!role)
        return message.reply(`Uh oh, I couldn't find any roles called ${search}! Ticket setup has been cancelled`);
      await message.reply(`Alright! \`${role.name}\` can now view the newly created tickets`);
    }
  } catch (ex) {
    return message.reply("No answer for 30 seconds, setup has cancelled");
  }

  try {
    // send an embed
    embed
      .setAuthor(title)
      .setDescription(`To create a ticket react with ${EMOJIS.TICKET_OPEN}`)
      .setFooter("You can only have 1 open ticket at a time!");

    const tktEmbed = await sendMessage(targetChannel, { embeds: [embed] });
    await tktEmbed.react(EMOJIS.TICKET_OPEN);

    // save to Database
    await createNewTicket(guild.id, targetChannel.id, tktEmbed.id, title, role?.id);

    // send success
    message.reply("Configuration saved! Ticket message is now setup 🎉");
  } catch (ex) {
    message.reply("Unexpected error occurred! Setup has cancelled");
  }
}

/**
 * @param {Message} message
 */
async function setupLogChannel({ guild }, target) {
  if (!canSendEmbeds(target)) return `Oops! I do have have permission to send embed to ${target}`;

  const settings = await getSettings(guild);
  settings.ticket.log_channel = target.id;
  await settings.save();

  return `Configuration saved! Ticket logs will be sent to ${target.toString()}`;
}

async function setupLimit({ guild }, limit) {
  if (Number.parseInt(limit, 10) < 5) return "Ticket limit cannot be less than 5";

  const settings = await getSettings(guild);
  settings.ticket.limit = limit;
  await settings.save();

  return `Configuration saved. You can now have a maximum of \`${limit}\` open tickets`;
}

async function close({ channel, author }) {
  if (!isTicketChannel(channel)) return "This command can only be used in ticket channels";
  const status = await closeTicket(channel, author, "Closed by a moderator");
  if (!status.success) return status.message;
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
