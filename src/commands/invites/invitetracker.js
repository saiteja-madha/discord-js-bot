const { Command } = require("@src/structures");
const { cacheGuildInvites } = require("@src/handlers/invite");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class InviteTracker extends Command {
  constructor(client) {
    super(client, {
      name: "invitetracker",
      description: "enable or disable invite tracking in the server",
      category: "INVITE",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        aliases: ["invitetracking"],
        usage: "<ON|OFF>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "status",
            description: "configuration status",
            required: true,
            type: "STRING",
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
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
    const status = args[0].toLowerCase();
    if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
    const response = await setStatus(message, status, data.settings);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const status = interaction.options.getString("status");
    const response = await setStatus(interaction, status, data.settings);
    await interaction.followUp(response);
  }
};

async function setStatus({ guild }, input, settings) {
  const status = input.toUpperCase() === "ON" ? true : false;

  if (status) {
    if (!guild.me.permissions.has(["MANAGE_GUILD", "MANAGE_CHANNELS"])) {
      return "Oops! I am missing `Manage Server`, `Manage Channels` permission!\nI cannot track invites";
    }

    const channelMissing = guild.channels.cache
      .filter((ch) => ch.type === "GUILD_TEXT" && !ch.permissionsFor(guild.me).has("MANAGE_CHANNELS"))
      .map((ch) => ch.name);

    if (channelMissing.length > 1) {
      return `I may not be able to track invites properly\nI am missing \`Manage Channel\` permission in the following channels \`\`\`${channelMissing.join(
        ", "
      )}\`\`\``;
    }

    await cacheGuildInvites(guild);
  } else {
    guild.client.inviteCache.delete(guild.id);
  }

  settings.invite.tracking = status;
  await settings.save();

  return `Configuration saved! Invite tracking is now ${status ? "enabled" : "disabled"}`;
}
