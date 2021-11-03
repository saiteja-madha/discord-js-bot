const { SlashCommand } = require("@src/structures");
const { CommandInteraction, Util } = require("discord.js");
const { addReactionRole, removeReactionRole, getReactionRoles } = require("@schemas/message-schema");

const channelPerms = ["READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class ReactionRole extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "rr",
      description: "setup reaction roles",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
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
              type: "ROLE",
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

    // add reaction role
    if (sub === "add") {
      const targetChannel = interaction.options.getChannel("channel");
      const messageId = interaction.options.getString("message_id");
      const reaction = interaction.options.getString("emoji");
      const role = interaction.options.getRole("role");

      if (!targetChannel.permissionsFor(interaction.guild.me).has(channelPerms)) {
        return interaction.followUp(
          `You need the following permissions in ${targetChannel.toString()}\n${this.parsePermissions(channelPerms)}`
        );
      }

      let targetMessage;
      try {
        targetMessage = await targetChannel.messages.fetch(messageId);
      } catch (ex) {
        return interaction.followUp("Could not fetch message. Did you provide a valid messageId?");
      }

      const custom = Util.parseEmoji(reaction);
      if (custom.id && !targetChannel.guild.emojis.cache.has(custom.id)) {
        return interaction.followUp("This emoji does not belong to this server");
      }

      const emoji = custom.id ? custom.id : custom.name;

      let reply = "";
      const previousRoles = getReactionRoles(interaction.guildId, targetChannel.id, targetMessage.id);
      if (previousRoles.length > 0) {
        const found = previousRoles.find((rr) => rr.emote === emoji);
        if (found) reply = "A role is already configured for this emoji. Overwriting data...\n";
      }

      try {
        await targetMessage.react(emoji);
      } catch (ex) {
        return interaction.followUp(`Oops! Failed to react. Is this a valid emoji: ${reaction} ?`);
      }

      await addReactionRole(interaction.guildId, targetChannel.id, targetMessage.id, emoji, role.id);
      return interaction.followUp((reply += "Done! Configuration saved"));
    }

    // remove reaction role
    else if (sub === "remove") {
      const targetChannel = interaction.options.getChannel("channel");
      const messageId = interaction.options.getString("message_id");

      if (!targetChannel.permissionsFor(interaction.guild.me).has()) {
        return interaction.followUp(
          `You need the following permissions in ${targetChannel.toString()}\n${this.parsePermissions(channelPerms)}`
        );
      }

      let targetMessage;
      try {
        targetMessage = await targetChannel.messages.fetch(messageId);
      } catch (ex) {
        return interaction.followUp("Could not fetch message. Did you provide a valid messageId?");
      }

      try {
        await removeReactionRole(interaction.guildId, targetChannel.id, targetMessage.id);
        targetMessage.reactions?.removeAll();
      } catch (ex) {
        return interaction.followUp("Oops! An unexpected error occurred. Try again later");
      }

      return interaction.followUp("Done! Configuration updated");
    }
  }
};
