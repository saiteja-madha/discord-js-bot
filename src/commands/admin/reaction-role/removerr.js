const { removeReactionRole } = require("@schemas/ReactionRoles");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "removerr",
  description: "remove configured reaction for the specified message",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel> <messageId>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "channel where the message exists",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "message_id",
        description: "message id for which reaction roles was configured",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`No channels found matching ${args[0]}`);

    const targetMessage = args[1];
    const response = await removeRR(message.guild, targetChannel[0], targetMessage);

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");

    const response = await removeRR(interaction.guild, targetChannel, messageId);
    await interaction.followUp(response);
  },
};

async function removeRR(guild, channel, messageId) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `You need the following permissions in ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
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
