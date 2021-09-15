const { Command } = require("@src/structures");
const { inviteTracking } = require("@schemas/guild-schema");
const { cacheGuildInvites } = require("@src/handlers/invite-handler");
const { Message } = require("discord.js");

module.exports = class InviteTracker extends Command {
  constructor(client) {
    super(client, {
      name: "invitetracker",
      description: "enable or disable invite tracking in the server",
      command: {
        enabled: true,
        aliases: ["invitetracking"],
        usage: "<ON|OFF>",
        minArgsCount: 1,
        category: "INVITE",
        userPermissions: ["ADMINISTRATOR"],
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { guild } = message;
    const input = args[0].toLowerCase();
    let status;

    if (input === "none" || input === "off" || input === "disable") status = false;
    else if (input === "on" || input === "enable") status = true;
    else return message.reply("Incorrect Command Usage");

    if (status) {
      if (!guild.me.permissions.has(["MANAGE_GUILD", "MANAGE_CHANNELS"])) {
        return message.reply(
          "Oops! I am missing `Manage Server`, `Manage Channels` permission!\nI cannot track invites"
        );
      }

      const channelMissing = guild.channels.cache
        .filter((ch) => ch.type === "GUILD_TEXT" && !ch.permissionsFor(guild.me).has("MANAGE_CHANNELS"))
        .map((ch) => ch.name);

      if (channelMissing.length > 1) {
        return message.reply(
          `I may not be able to track invites properly\nI am missing \`Manage Channel\` permission in the following channels \`\`\`${channelMissing.join(
            ", "
          )}\`\`\``
        );
      }

      await cacheGuildInvites(guild);
    } else {
      this.client.inviteCache.delete(message.guildId);
    }

    await inviteTracking(guild.id, status);
    message.channel.send(`Configuration saved! Invite tracking is now ${status ? "enabled" : "disabled"}`);
  }
};
