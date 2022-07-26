const { cacheGuildInvites, resetInviteCache } = require("@handlers/invite");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "invitetracker",
  description: "enable or disable invite tracking in the server",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
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
        type: ApplicationCommandOptionType.String,
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

  async messageRun(message, args, data) {
    const status = args[0].toLowerCase();
    if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
    const response = await setStatus(message, status, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const status = interaction.options.getString("status");
    const response = await setStatus(interaction, status, data.settings);
    await interaction.followUp(response);
  },
};

async function setStatus({ guild }, input, settings) {
  const status = input.toUpperCase() === "ON" ? true : false;

  if (status) {
    if (!guild.members.me.permissions.has(["ManageGuild", "ManageChannels"])) {
      return "Oops! I am missing `Manage Server`, `Manage Channels` permission!\nI cannot track invites";
    }

    const channelMissing = guild.channels.cache
      .filter((ch) => ch.type === ChannelType.GuildText && !ch.permissionsFor(guild.members.me).has("ManageChannels"))
      .map((ch) => ch.name);

    if (channelMissing.length > 1) {
      return `I may not be able to track invites properly\nI am missing \`Manage Channel\` permission in the following channels \`\`\`${channelMissing.join(
        ", "
      )}\`\`\``;
    }

    await cacheGuildInvites(guild);
  } else {
    resetInviteCache(guild.id);
  }

  settings.invite.tracking = status;
  await settings.save();

  return `Configuration saved! Invite tracking is now ${status ? "enabled" : "disabled"}`;
}
