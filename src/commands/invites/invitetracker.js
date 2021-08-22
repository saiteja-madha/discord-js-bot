const { Command, CommandContext } = require("@src/structures");
const { inviteTracking } = require("@schemas/guild-schema");
const { cacheGuildInvites } = require("@features/invite-tracker");

module.exports = class InviteTracker extends Command {
  constructor(client) {
    super(client, {
      name: "invitetracker",
      description: "enable or disable invite tracking in the server",
      usage: "<ON|OFF>",
      minArgsCount: 1,
      aliases: ["invitetracking"],
      category: "INVITE",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild } = ctx;
    const input = args[0].toLowerCase();
    let status;

    if (input === "none" || input === "off" || input === "disable") status = false;
    else if (input === "on" || input === "enable") status = true;
    else return ctx.reply("Incorrect Command Usage");

    if (status) {
      if (!guild.me.permissions.has(["MANAGE_GUILD", "MANAGE_CHANNELS"])) {
        return await ctx.reply(
          "Oops! I am missing `Manage Server`, `Manage Channels` permission!\nI cannot track invites"
        );
      }

      const channelMissing = guild.channels.cache
        .filter((ch) => ch.type === "GUILD_TEXT" && !ch.permissionsFor(guild.me).has("MANAGE_CHANNELS"))
        .map((ch) => ch.name);

      if (channelMissing.length > 1) {
        return ctx.reply(
          "I may not be able to track invites properly\nI am missing `Manage Channel` permission in the following channels ```" +
            channelMissing.join(", ") +
            "```"
        );
      }
    }

    try {
      await cacheGuildInvites(guild);
    } catch (ex) {
      return ctx.reply("Unexpected error occurred while caching the invites!");
    }

    inviteTracking(guild.id, status)
      .then(() => {
        ctx.reply(`Configuration saved! Invite tracking is now ${status ? "enabled" : "disabled"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Unexpected backend error");
      });
  }
};
