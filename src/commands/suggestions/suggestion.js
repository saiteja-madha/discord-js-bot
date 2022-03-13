const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { approveSuggestion, rejectSuggestion } = require("@src/handlers/suggestion");

module.exports = class Suggestion extends Command {
  constructor(client) {
    super(client, {
      name: "suggestion",
      description: "configure suggestion system",
      category: "SUGGESTION",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 2,
        subcommands: [
          {
            trigger: "channel <#channel|OFF>",
            description: "configure suggestion channel or disable it",
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
            name: "approve",
            description: "approve a suggestion",
            type: "SUB_COMMAND",
            options: [
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
                name: "message_id",
                description: "the message id of the suggestion",
                type: "STRING",
                required: true,
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
    const sub = args[0];
    let response;

    // channel
    if (sub == "channel") {
      const input = args[1];
      if (input.toLowerCase() == "off") {
        response = await setChannel(data.settings, null);
      } else {
        let matched = message.guild.findMatchingChannels(input).filter((c) => c.type == "GUILD_TEXT");
        if (matched.length == 0) response = `No matching channels found for ${input}`;
        else if (matched.length > 1) response = `Multiple channels found for ${input}. Please be more specific.`;
        else response = await setChannel(data.settings, matched[0]);
      }
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
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // channel
    if (sub == "channel") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setChannel(data.settings, channel);
    }

    // approve
    else if (sub == "approve") {
      const messageId = interaction.options.getString("message_id");
      response = await approveSuggestion(interaction.guild, interaction.member, messageId);
    }

    // reject
    else if (sub == "reject") {
      const messageId = interaction.options.getString("message_id");
      response = await rejectSuggestion(interaction.guild, interaction.member, messageId);
    }

    // else
    else response = "Not a valid subcommand";
    await interaction.followUp(response);
  }
};

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "Suggestion system is now disabled";
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `Suggestions will now be sent to ${channel.name}`;
}
