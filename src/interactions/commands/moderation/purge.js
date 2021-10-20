const { sendMessage } = require("@root/src/utils/botUtils");
const { purgeMessages } = require("@root/src/utils/modUtils");
const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");

module.exports = class PurgeCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "purge",
      description: "cleans messages from a channel",
      enabled: true,
      category: "MODERATION",
      userPermissions: ["MANAGE_MESSAGES"],
      options: [
        {
          name: "all",
          description: "purge all messages",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel from which messages must be cleaned",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "amount",
              description: "number of messages to be deleted (Max 99)",
              type: "INTEGER",
              required: false,
            },
          ],
        },
        {
          name: "attachments",
          description: "purge all messages with attachments",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel from which messages must be cleaned",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "amount",
              description: "number of messages to be deleted (Max 99)",
              type: "INTEGER",
              required: false,
            },
          ],
        },
        {
          name: "bots",
          description: "purge all bot messages",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel from which messages must be cleaned",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "amount",
              description: "number of messages to be deleted (Max 99)",
              type: "INTEGER",
              required: false,
            },
          ],
        },
        {
          name: "links",
          description: "purge all messages with links",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel from which messages must be cleaned",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "amount",
              description: "number of messages to be deleted (Max 99)",
              type: "INTEGER",
              required: false,
            },
          ],
        },
        {
          name: "token",
          description: "purge all messages containing the specified token",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel from which messages must be cleaned",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "token",
              description: "token to be looked up in messages",
              type: "STRING",
              required: true,
            },
            {
              name: "amount",
              description: "number of messages to be deleted (Max 99)",
              type: "INTEGER",
              required: false,
            },
          ],
        },
        {
          name: "user",
          description: "purge all messages from the specified user",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel from which messages must be cleaned",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"],
              required: true,
            },
            {
              name: "user",
              description: "user whose messages needs to be cleaned",
              type: "USER",
              required: true,
            },
            {
              name: "amount",
              description: "number of messages to be deleted (Max 99)",
              type: "INTEGER",
              required: false,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const { options, member } = interaction;

    const sub = options.getSubcommand();
    const channel = options.getChannel("channel");
    const amount = options.getInteger("amount") || 99;

    let response, args;
    switch (sub) {
      case "all":
        response = await purgeMessages(member, channel, "ALL", amount);
        break;

      case "attachments":
        response = await purgeMessages(member, channel, "ATTACHMENT", amount);
        break;

      case "bots":
        response = await purgeMessages(member, channel, "BOT", amount);
        break;

      case "links":
        response = await purgeMessages(member, channel, "LINK", amount);
        break;

      case "token":
        args = interaction.options.getString("token");
        response = await purgeMessages(member, channel, "TOKEN", amount, args);
        break;

      case "user":
        args = interaction.options.getUser("user");
        response = await purgeMessages(member, channel, "TOKEN", amount, args);
        break;

      default:
        return interaction.followUp("Oops! Not a valid command selection");
    }

    if (!response.success) {
      return interaction.followUp(response.message);
    }

    if (channel.id !== interaction.channelId) await interaction.followUp(response);
    else {
      await sendMessage(channel, response.message);
    }
  }
};
