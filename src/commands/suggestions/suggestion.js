const { approveSuggestion, rejectSuggestion } = require("@src/handlers/suggestion");
const { getMatchingChannels } = require("@utils/guildUtils");
const { parsePermissions } = require("@utils/botUtils");

const CHANNEL_PERMS = ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggestion",
  description: "configure suggestion system",
  category: "SUGGESTION",
  userPermissions: ["MANAGE_GUILD"],
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
        description: "configure suggestion approval channel or disable it",
      },
      {
        trigger: "rejch <#channel>",
        description: "configure suggestion rejected channel or disable it",
      },
      {
        trigger: "approve <messageId>",
        description: "approve a suggestion",
      },
      {
        trigger: "reject <messageId>",
        description: "reject a suggestion",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "enable or disable welcome message",
        type: "SUB_COMMAND",
        options: [
          {
            name: "status",
            description: "enabled or disabled",
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
      {
        name: "channel",
        description: "configure suggestion channel or disable it",
        type: "SUB_COMMAND",
        options: [
          {
            name: "channel_name",
            description: "the channel where suggestions will be sent",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: false,
          },
        ],
      },
      {
        name: "appch",
        description: "configure suggestion approval channel or disable it",
        type: "SUB_COMMAND",
        options: [
          {
            name: "channel_name",
            description: "the channel where approved suggestions will be sent",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: false,
          },
        ],
      },
      {
        name: "rejch",
        description: "configure suggestion rejected channel or disable it",
        type: "SUB_COMMAND",
        options: [
          {
            name: "channel_name",
            description: "the channel where rejected suggestions will be sent",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: false,
          },
        ],
      },
      {
        name: "approve",
        description: "approve a suggestion",
        type: "SUB_COMMAND",
        options: [
          {
            name: "channel_name",
            description: "the channel where message exists",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
          {
            name: "message_id",
            description: "the message id of the suggestion",
            type: "STRING",
            required: true,
          },
        ],
      },
      {
        name: "reject",
        description: "reject a suggestion",
        type: "SUB_COMMAND",
        options: [
          {
            name: "channel_name",
            description: "the channel where message exists",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
          {
            name: "message_id",
            description: "the message id of the suggestion",
            type: "STRING",
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
      let matched = getMatchingChannels(message.guild, input).filter((c) => c.type == "GUILD_TEXT");
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "appch") {
      const input = args[1];
      let matched = getMatchingChannels(message.guild, input).filter((c) => c.type == "GUILD_TEXT");
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "rejch") {
      const input = args[1];
      let matched = getMatchingChannels(message.guild, input).filter((c) => c.type == "GUILD_TEXT");
      if (matched.length == 0) response = `No matching channels found for ${input}`;
      else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "approve") {
      const messageId = args[1];
      response = await approveSuggestion(message.guild, message.member, messageId);
    }

    // reject
    else if (sub == "reject") {
      const messageId = args[1];
      response = await rejectSuggestion(message.guild, message.member, messageId);
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

  if (!channel.permissionsFor(channel.guild.me).has(CHANNEL_PERMS)) {
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

  if (!channel.permissionsFor(channel.guild.me).has(CHANNEL_PERMS)) {
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

  if (!channel.permissionsFor(channel.guild.me).has(CHANNEL_PERMS)) {
    return `I need the following permissions in ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `Rejected suggestions will now be sent to ${channel}`;
}
