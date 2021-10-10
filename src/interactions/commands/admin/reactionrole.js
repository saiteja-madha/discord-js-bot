const { SlashCommand } = require("@src/structures");
const { CommandInteraction, Util, BaseGuildTextChannel } = require("discord.js");
const { addReactionRole, removeReactionRole } = require("@schemas/reactionrole-schema");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class ReactionRole extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "rr",
      description: "setup reaction roles",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      options: [
        {
          name: "add",
          description: "create a new reaction role",
          type: "SUB_COMMAND",
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
              type: "MENTIONABLE",
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "remove a previously configured reaction role",
          type: "SUB_COMMAND",
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
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // addrr
    if (sub === "add") {
      const targetChannel = interaction.options.getChannel("channel");
      const messageId = interaction.options.getString("messageId");
      const reaction = interaction.options.getString("emoji");
      const role = interaction.options.getMentionable("role");
      response = await this.addrr(targetChannel, messageId, reaction, role);
    }

    // removerr
    else if (sub === "remove") {
      const targetChannel = interaction.options.getChannel("channel");
      const messageId = interaction.options.getString("messageId");
      response = await this.removerr(targetChannel, messageId);
    }

    return interaction.followUp(response);
  }

  /**
   * @param {BaseGuildTextChannel} channel
   * @param {string} messageId
   * @param {string} emoji
   * @param {string} role
   */
  async addrr(channel, messageId, reaction, role) {
    if (!channel.permissionsFor(channel.guild.me).has()) {
      return `You need the following permissions in ${channel.toString()}\n${this.parsePermissions(channelPerms)}`;
    }

    let targetMessage;
    try {
      targetMessage = await channel.messages.fetch(messageId);
    } catch (ex) {
      return "Could not fetch message. Did you provide a valid messageId?";
    }

    const custom = Util.parseEmoji(reaction);
    if (custom.id && !channel.guild.emojis.cache.has(custom.id)) {
      return "This emoji does not belong to this server";
    }

    const emoji = custom.id ? custom.id : custom.name;
    try {
      await targetMessage.react(emoji);
    } catch (ex) {
      return `Oops! Failed to react. Is this a valid emoji: ${reaction} ?`;
    }

    await addReactionRole(channel.guildId, channel.id, targetMessage.id, emoji, role.id);
    return "Done! Configuration saved";
  }

  /**
   * @param {BaseGuildTextChannel} channel
   * @param {string} messageId
   */
  async removerr(channel, messageId) {
    if (!channel.permissionsFor(channel.guild.me).has()) {
      return `You need the following permissions in ${channel.toString()}\n${this.parsePermissions(channelPerms)}`;
    }

    let targetMessage;
    try {
      targetMessage = await channel.messages.fetch(messageId);
    } catch (ex) {
      return "Could not fetch message. Did you provide a valid messageId?";
    }

    try {
      await removeReactionRole(channel.guildId, channel.id, targetMessage.id);
      targetMessage.reactions?.removeAll();
    } catch (ex) {
      return "Oops! An unexpected error occurred. Try again later";
    }

    return "Done! Configuration updated";
  }
};
