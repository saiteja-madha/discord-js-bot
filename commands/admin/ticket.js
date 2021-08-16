const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@root/structures");
const { sendMessage } = require("@root/utils/botUtils");
const { canSendEmbeds, findMatchingRoles } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets, PERMS } = require("@utils/ticketUtils");
const { setTicketLogChannel, setTicketLimit } = require("@schemas/settings-schema");
const { createNewTicket } = require("@schemas/ticket-schema");
const outdent = require("outdent");
const { EMOJIS } = require("@root/config.json");

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "various ticketing commands",
      minArgsCount: 1,
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
        ctx.reply("Invalid input");
    }
  }
};

/**
 * @param {CommandContext} ctx
 */
async function setupTicket(ctx) {
  const { message, channel, guild } = ctx;
  const filter = (m) => m.author.id === message.author.id;

  // wait for channel
  await ctx.reply("Please `mention the channel` in which the reaction message must be sent");
  let reply = await channel.awaitMessages({ filter, max: 1, time: 10000 });
  let targetChannel = reply.first().mentions.channels.first();
  if (!targetChannel) return ctx.reply("Failed to setup ticket. You did not mention a channel");
  if (!targetChannel.isText() && !targetChannel.permissionsFor(guild.me).has(PERMS))
    return ctx.reply("Missing permissions to send embeds in that channel");

  // wait for title
  await ctx.reply("Please enter the `title` of the ticket");
  reply = await channel.awaitMessages({ filter, max: 1, time: 10000 });
  let title = reply.first().content;

  // wait for roles
  await ctx.reply(outdent`What roles should have access to view the newly created tickets?
  Please type the name of a existing role in this server.
  Alternatively you can type \`none\``);
  reply = await channel.awaitMessages({ filter, max: 1, time: 10000 });
  let search = reply.first().content;
  let role;
  if (search.toLowerCase() !== "none") {
    role = findMatchingRoles(guild, search)[0];
    if (!role) return ctx.reply(`Uh oh, I couldn't find any roles called ${search}! Try again`);
    await ctx.reply(`Alright! ${role.name} can now view the newly created tickets`);
  }

  // send an embed
  const embed = new MessageEmbed()
    .setAuthor(title)
    .setDescription(`To create a ticket react with ${EMOJIS.TICKET_OPEN}`)
    .setFooter("You can only have 1 open ticket at a time!");

  const tktEmbed = await sendMessage(targetChannel, { embeds: [embed] });
  await tktEmbed.react(EMOJIS.TICKET_OPEN);

  // save to Database
  await createNewTicket(guild.id, targetChannel.id, tktEmbed.id, title, role?.id);
}

/**
 * @param {CommandContext} ctx
 */
async function setupLogChannel(ctx) {
  if (ctx.message.mentions.channels.size === 0)
    return await ctx.message.reply("Please mention a channel name where ticket logs must be sent");

  const target = ctx.message.mentions.channels.first();
  if (!canSendEmbeds(target)) return await ctx.reply("I do have have permission to send embed to " + target.toString());

  setTicketLogChannel(ctx.guild.id, target.id).then(
    ctx.reply("Configuration saved! Newly created ticket logs will be sent to " + target.toString())
  );
}

/**
 * @param {CommandContext} ctx
 */
async function setupLimit(ctx) {
  const limit = ctx.args[1];
  if (!limit || isNaN(limit)) return ctx.message.reply("Please enter an integer input");
  setTicketLimit(ctx.guild.id, limit).then(ctx.reply("Configuration saved"));
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
  if (!inputId || isNaN(inputId)) ctx.reply("Oops! You need to input a valid userId/roleId");

  ctx.channel.permissionOverwrites
    .create(inputId, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    })
    .then(() => ctx.reply("Done!"))
    .catch(ctx.reply("Failed to add user/role. Did you provide a valid ID?"));
}

/**
 * @param {CommandContext} ctx
 */
async function removeFromTicket(ctx) {
  if (!isTicketChannel(ctx.channel)) return await ctx.message.reply("This command can only be used in ticket channel");

  const inputId = ctx.args[1];
  if (!inputId || isNaN(inputId)) ctx.reply("Oops! You need to input a valid userId/roleId");

  ctx.channel.permissionOverwrites
    .create(inputId, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    })
    .then(() => ctx.reply("Done!"))
    .catch(ctx.reply("Failed to remove user/role. Did you provide a valid ID?"));
}
