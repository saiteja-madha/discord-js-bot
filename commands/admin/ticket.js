const { setTicketLogChannel, setTicketLimit } = require("@root/schemas/settings-schema");
const { Command, CommandContext } = require("@root/structures");
const { canSendEmbeds } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@utils/ticketUtils");

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
async function setupTicket(ctx) {}

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
