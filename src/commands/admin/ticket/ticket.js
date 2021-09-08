const { MessageEmbed, Message } = require("discord.js");
const { Command } = require("@src/structures");
const { sendMessage } = require("@utils/botUtils");
const { canSendEmbeds, findMatchingRoles } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets, PERMS } = require("@utils/ticketUtils");
const { setTicketLogChannel, setTicketLimit } = require("@schemas/guild-schema");
const { createNewTicket } = require("@schemas/ticket-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");

const SETUP_TIMEOUT = 30 * 1000;

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
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
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args, invoke, prefix) {
    const input = args[0].toLowerCase();

    switch (input) {
      case "setup":
        return setupTicket(message);

      case "log":
        return setupLogChannel(message);

      case "limit":
        return setupLimit(message);

      case "close":
        return close(message);

      case "closeall":
        return closeAll(message);

      case "add":
        return addToTicket(message);

      case "remove":
        return removeFromTicket(message);

      default:
        this.sendUsage(message.channel, prefix, invoke, "Incorrect Input");
    }
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
async function setupLogChannel(message) {
  if (message.mentions.channels.size === 0)
    return message.reply("Incorrect Usage! You need to mention a channel name where ticket logs must be sent");

  const target = message.mentions.channels.first();
  if (!canSendEmbeds(target))
    return message.reply(`Oops! I do have have permission to send embed to ${target.toString()}`);

  setTicketLogChannel(message.guildId, target.id).then(
    message.channel.send(`Configuration saved! Newly created ticket logs will be sent to ${target.toString()}`)
  );
}

/**
 * @param {Message} message
 */
async function setupLimit(message) {
  const limit = message.args[1];
  if (!limit || isNaN(limit))
    return message.message.reply("Incorrect usage! You did not provide a valid integer input");
  if (Number.parseInt(limit, 10) < 5) return message.message.reply("Ticket limit cannot be less than 5");
  setTicketLimit(message.guild.id, limit).then(
    message.reply(`Configuration saved. You can now have a maximum of \`${limit}\` open tickets`)
  );
}

/**
 * @param {Message} message
 */
async function close(message) {
  if (isTicketChannel(message.channel)) {
    const status = await closeTicket(message.channel, message.author, "Closed by a moderator");
    if (!status.success) message.message.reply(status.message);
  } else {
    message.message.reply("This command can only be used in ticket channels");
  }
}

/**
 * @param {Message} message
 */
async function closeAll(message) {
  const reply = await message.reply("Closing...");
  const stats = await closeAllTickets(message.guild);
  if (reply?.editable) reply.edit(`Completed! Success: \`${stats[0]}\` Failed: \`${stats[1]}\``);
}

/**
 * @param {Message} message
 */
async function addToTicket(message) {
  if (!isTicketChannel(message.channel))
    return message.message.reply("This command can only be used in ticket channel");

  const inputId = message.args[1];
  if (!inputId || isNaN(inputId)) return message.reply("Oops! You need to input a valid userId/roleId");

  try {
    await message.channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    });

    message.message.reply("Done");
  } catch (ex) {
    message.reply("Failed to add user/role. Did you provide a valid ID?");
  }
}

/**
 * @param {Message} message
 */
async function removeFromTicket(message) {
  if (!isTicketChannel(message.channel))
    return message.message.reply("This command can only be used in ticket channel");

  const inputId = message.args[1];
  if (!inputId || isNaN(inputId)) return message.reply("Oops! You need to input a valid userId/roleId");

  try {
    message.channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });

    message.message.reply("Done");
  } catch (ex) {
    message.reply("Failed to remove user/role. Did you provide a valid ID?");
  }
}
