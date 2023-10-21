const { approveSuggestion, rejectSuggestion } = require("@handlers/suggestion");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const CHANNEL_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks", "ManageMessages", "ReadMessageHistory"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggestion",
  description: "configure suggestion system",
  category: "SUGGESTION",
  userPermissions: ["ManageGuild"],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "enable or disable suggestion status",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "enabled or disabled",
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
      {
        name: "channel",
        description: "configure suggestion channel or disable it",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "the channel where suggestions will be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "appch",
        description: "configure approved suggestions channel or disable it",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "the channel where approved suggestions will be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "rejch",
        description: "configure rejected suggestions channel or disable it",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "the channel where rejected suggestions will be sent",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "approve",
        description: "approve a suggestion",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "the channel where message exists",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "the message id of the suggestion",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "the reason for the approval",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "reject",
        description: "reject a suggestion",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "the channel where message exists",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "the message id of the suggestion",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "the reason for the rejection",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "staffadd",
        description: "add a staff role",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "the role to add as a staff",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: "staffremove",
        description: "staffremove a staff role",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "the role to staffremove from a staff",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub == "status") {
      const status = interaction.options.getString("status");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setChannel(data.settings, channel);
    }

    // app_channel
    else if (sub == "appch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setApprovedChannel(data.settings, channel);
    }

    // rej_channel
    else if (sub == "rejch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setRejectedChannel(data.settings, channel);
    }

    // approve
    else if (sub == "approve") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await approveSuggestion(interaction.member, channel, messageId);
    }

    // reject
    else if (sub == "reject") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await rejectSuggestion(interaction.member, channel, messageId);
    }

    // staffadd
    else if (sub == "staffadd") {
      const role = interaction.options.getRole("role");
      response = await addStaffRole(data.settings, role);
    }

    // staffremove
    else if (sub == "staffremove") {
      const role = interaction.options.getRole("role");
      response = await removeStaffRole(data.settings, role);
    }

    // else
    else response = "Not a valid subcommand";
    await interaction.followUp(response);
  },
};

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.suggestions.enabled = enabled;
  await settings.save();
  return `Suggestion system is now ${enabled ? "enabled" : "disabled"}`;
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "Suggestion system is now disabled";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `I need the following permissions in ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `Suggestions will now be sent to ${channel}`;
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null;
    await settings.save();
    return "Suggestion approved channel is now disabled";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `I need the following permissions in ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.approved_channel = channel.id;
  await settings.save();
  return `Approved suggestions will now be sent to ${channel}`;
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null;
    await settings.save();
    return "Suggestion rejected channel is now disabled";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `I need the following permissions in ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `Rejected suggestions will now be sent to ${channel}`;
}

async function addStaffRole(settings, role) {
  if (settings.suggestions.staff_roles.includes(role.id)) {
    return `\`${role.name}\` is already a staff role`;
  }
  settings.suggestions.staff_roles.push(role.id);
  await settings.save();
  return `\`${role.name}\` is now a staff role`;
}

async function removeStaffRole(settings, role) {
  if (!settings.suggestions.staff_roles.includes(role.id)) {
    return `${role} is not a staff role`;
  }
  settings.suggestions.staff_roles.splice(settings.suggestions.staff_roles.indexOf(role.id), 1);
  await settings.save();
  return `\`${role.name}\` is no longer a staff role`;
}
