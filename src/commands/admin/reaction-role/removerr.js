const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { removeReactionRole } = require("@schemas/Message");
const { parsePermissions } = require("@utils/botUtils");
const { getMatchingChannel } = require("@utils/guildUtils");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class RemoveReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "removerr",
      description: "remove configured reaction for the specified message",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        usage: "<#channel> <messageid>",
        minArgsCount: 2,
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "channel",
            description: "channel where the message exists",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true,
          },
          {
            name: "message_id",
            description: "message id for which reaction roles was configured",
            type: "STRING",
            required: true,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const targetChannel = getMatchingChannel(message.guild, args[0]);
    if (targetChannel.length === 0) return message.reply(`No channels found matching ${args[0]}`);

    const targetMessage = args[1];
    const response = await removeRR(message.guild, targetChannel[0], targetMessage);

    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");

    const response = await removeRR(interaction.guild, targetChannel, messageId);
    await interaction.followUp(response);
  }
};

async function removeRR(guild, channel, messageId) {
  if (!channel.permissionsFor(guild.me).has(channelPerms)) {
    return `You need the following permissions in ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch(messageId);
  } catch (ex) {
    return "Could not fetch message. Did you provide a valid messageId?";
  }

  try {
    await removeReactionRole(guild.id, channel.id, targetMessage.id);
    await targetMessage.reactions?.removeAll();
  } catch (ex) {
    return "Oops! An unexpected error occurred. Try again later";
  }

  return "Done! Configuration updated";
}
