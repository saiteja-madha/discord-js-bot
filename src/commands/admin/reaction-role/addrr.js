const { Command } = require("@src/structures");
const { findMatchingRoles, getMatchingChannels } = require("@utils/guildUtils");
const { addReactionRole, getReactionRoles } = require("@schemas/Message");
const { Util, Message, CommandInteraction } = require("discord.js");
const { parsePermissions } = require("@utils/botUtils");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class AddReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "addrr",
      description: "setup reaction role for the specified message",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        usage: "<#channel> <messageid> <emote> <role>",
        minArgsCount: 4,
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
            description: "message id to which reaction roles must be configured",
            type: "STRING",
            required: true,
          },
          {
            name: "emoji",
            description: "emoji to use",
            type: "STRING",
            required: true,
          },
          {
            name: "role",
            description: "role to be given for the selected emoji",
            type: "ROLE",
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
    const targetChannel = getMatchingChannels(message.guild, args[0]);
    if (targetChannel.length === 0) return message.safeReply(`No channels found matching ${args[0]}`);

    const targetMessage = args[1];

    const role = findMatchingRoles(message.guild, args[3])[0];
    if (!role) return message.safeReply(`No roles found matching ${args[3]}`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");
    const reaction = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role);
    await interaction.followUp(response);
  }
};

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.me).has(channelPerms)) {
    return `You need the following permissions in ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch(messageId);
  } catch (ex) {
    return "Could not fetch message. Did you provide a valid messageId?";
  }

  if (role.managed) {
    return "I cannot assign bot roles.";
  }

  if (guild.roles.everyone.id === role.id) {
    return "You cannot assign the everyone role.";
  }

  if (guild.me.roles.highest.position < role.position) {
    return "Oops! I cannot add/remove members to that role. Is that role higher than mine?";
  }

  const custom = Util.parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return "This emoji does not belong to this server";
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `Oops! Failed to react. Is this a valid emoji: ${reaction} ?`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = "A role is already configured for this emoji. Overwriting data,\n";
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += "Done! Configuration saved");
}
