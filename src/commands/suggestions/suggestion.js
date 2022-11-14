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
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "enable/disable suggestion system",
      },
      {
        trigger: "channel <#channel|off>",
        description: "configure suggestion channel or disable it",
      },
      {
        trigger: "appch <#channel>",
        description: "configure approved suggestions channel or disable it",
      },
      {
        trigger: "rejch <#channel>",
        description: "configure rejected suggestions channel or disable it",
      },
      {
        trigger: "approve <channel> <messageId> [reason]",
        description: "approve a suggestion",
      },
      {
        trigger: "reject <channel> <messageId> [reason]",
        description: "reject a suggestion",
      },
      {
        trigger: "staffadd <roleId>",
        description: "add a staff role",
      },
      {
        trigger: "staffremove <roleId>",
        description: "remove a staff role",
      },
    ],
  },
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

  async messageRun(message, args, data) {
    const sub = args[0];
    let response;

    // status
    if (sub == "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Invalid status. Value must be `on/off`");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "appch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "rejch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "approve") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await approveSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // reject
    else if (sub == "reject") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await rejectSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // staffadd
    else if (sub == "staffadd") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `No matching roles found for ${input}`;
      else if (matched.length > 1) response = `Multiple roles found for ${input}. Please be more specific.`;
      else response = await addStaffRole(data.settings, matched[0]);
    }

    // staffremove
    else if (sub == "staffremove") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `No matching roles found for ${input}`;
      else if (matched.length > 1) response = `Multiple roles found for ${input}. Please be more specific.`;
      else response = await removeStaffRole(data.settings, matched[0]);
    }

    // else
    else response = "Not a valid subcommand";
    await message.safeReply(response);
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
