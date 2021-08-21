const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const { sendMessage } = require("@utils/botUtils");
const { canSendEmbeds, findMatchingRoles } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets, PERMS } = require("@utils/ticketUtils");
const { setTicketLogChannel, setTicketLimit } = require("@schemas/settings-schema");
const { createNewTicket } = require("@schemas/ticket-schema");
const outdent = require("outdent");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");

const SETUP_TIMEOUT = 30 * 1000;

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
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
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const input = ctx.args[0].toLowerCase();

    switch (input) {
      case "setup":
        return await setupTicket(ctx);

      case "log":
        return await setupLogChannel(ctx);

      case "limit":
        return await setupLimit(ctx);

      case "close":
        return await close(ctx);

      case "closeall":
        return await closeAll(ctx);

      case "add":
        return await addToTicket(ctx);

      case "remove":
        return await removeFromTicket(ctx);

      default:
        this.sendUsage(ctx.channel, ctx.prefix, ctx.invoke, "Incorrect Input");
    }
  }
};

/**
 * @param {CommandContext} ctx
 */
async function setupTicket(ctx) {
  const { message, channel, guild } = ctx;
  const filter = (m) => m.author.id === message.author.id;
  let embed = new MessageEmbed()
    .setAuthor("Ticket Setup")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter("Type cancel to cancel setup");

  let targetChannel, title, role;
  try {
    // wait for channel
    await ctx.reply({
      embeds: [embed.setDescription("Please `mention the channel` in which the reaction message must be sent")],
    });
    let reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    if (reply.first().content === "cancel") return ctx.reply("Ticket setup has been cancelled");
    targetChannel = reply.first().mentions.channels.first();
    if (!targetChannel) return ctx.reply("Ticket setup has been cancelled. You did not mention a channel");
    if (!targetChannel.isText() && !targetChannel.permissionsFor(guild.me).has(PERMS))
      return ctx.reply(
        `Ticket setup has been cancelled. I do not have permission to send embed to ${targetChannel.toString()}`
      );

    // wait for title
    await ctx.reply({ embeds: [embed.setDescription("Please enter the `title` of the ticket")] });
    reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    if (reply.first().content === "cancel") return ctx.reply("Ticket setup has been cancelled");
    title = reply.first().content;

    // wait for roles
    let desc = outdent`What roles should have access to view the newly created tickets?
  Please type the name of a existing role in this server.\n
  Alternatively you can type \`none\``;
    await ctx.reply({ embeds: [embed.setDescription(desc)] });
    reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    let search = reply.first().content;
    if (search === "cancel") return ctx.reply("Ticket setup has been cancelled");
    if (search.toLowerCase() !== "none") {
      role = findMatchingRoles(guild, search)[0];
      if (!role) return ctx.reply(`Uh oh, I couldn't find any roles called ${search}! Ticket setup has been cancelled`);
      await ctx.reply(`Alright! \`${role.name}\` can now view the newly created tickets`);
    }
  } catch (ex) {
    return ctx.reply("No answer for 30 seconds, setup has cancelled");
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
    ctx.reply("Configuration saved! Ticket message is now setup 🎉");
  } catch (ex) {
    ctx.reply("Unexpected error occurred! Setup has cancelled");
  }
}

/**
 * @param {CommandContext} ctx
 */
async function setupLogChannel(ctx) {
  if (ctx.message.mentions.channels.size === 0)
    return await ctx.message.reply(
      "Incorrect Usage! You need to mention a channel name where ticket logs must be sent"
    );

  const target = ctx.message.mentions.channels.first();
  if (!canSendEmbeds(target))
    return await ctx.reply("Oops! I do have have permission to send embed to " + target.toString());

  setTicketLogChannel(ctx.guild.id, target.id).then(
    ctx.reply("Configuration saved! Newly created ticket logs will be sent to " + target.toString())
  );
}

/**
 * @param {CommandContext} ctx
 */
async function setupLimit(ctx) {
  const limit = ctx.args[1];
  if (!limit || isNaN(limit)) return ctx.message.reply(`Incorrect usage! You did not provide a valid integer input`);
  if (Number.parseInt(limit) < 5) return ctx.message.reply("Ticket limit cannot be less than 5");
  setTicketLimit(ctx.guild.id, limit).then(
    ctx.reply(`Configuration saved. You can now have a maximum of \`${limit}\` open tickets`)
  );
}

/**
 * @param {CommandContext} ctx
 */
async function close(ctx) {
  if (isTicketChannel(ctx.channel)) {
    const status = await closeTicket(ctx.channel, ctx.author, "Closed by a moderator");
    if (!status.success) ctx.message.reply(status.message);
  } else {
    ctx.message.reply("This command can only be used in ticket channels");
  }
}

/**
 * @param {CommandContext} ctx
 */
async function closeAll(ctx) {
  const reply = await ctx.reply("Closing...");
  const stats = await closeAllTickets(ctx.guild);
  if (reply?.editable) reply.edit(`Completed! Success: \`${stats[0]}\` Failed: \`${stats[1]}\``);
}

/**
 * @param {CommandContext} ctx
 */
async function addToTicket(ctx) {
  if (!isTicketChannel(ctx.channel)) return await ctx.message.reply("This command can only be used in ticket channel");

  const inputId = ctx.args[1];
  if (!inputId || isNaN(inputId)) return ctx.reply("Oops! You need to input a valid userId/roleId");

  try {
    await ctx.channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    });

    ctx.message.reply("Done");
  } catch (ex) {
    ctx.reply("Failed to add user/role. Did you provide a valid ID?");
  }
}

/**
 * @param {CommandContext} ctx
 */
async function removeFromTicket(ctx) {
  if (!isTicketChannel(ctx.channel)) return await ctx.message.reply("This command can only be used in ticket channel");

  const inputId = ctx.args[1];
  if (!inputId || isNaN(inputId)) return ctx.reply("Oops! You need to input a valid userId/roleId");

  try {
    ctx.channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });

    ctx.message.reply("Done");
  } catch (ex) {
    ctx.reply("Failed to remove user/role. Did you provide a valid ID?");
  }
}
