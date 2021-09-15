const { removeReactionRole } = require("@root/src/schemas/reactionrole-schema");
const { Command } = require("@src/structures");
const { Message } = require("discord.js");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class RemoveReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "removerr",
      description: "remove configured reaction for the specified message",
      command: {
        enabled: true,
        usage: "<#channel> <messageid>",
        minArgsCount: 2,
        category: "ADMIN",
        userPermissions: ["ADMINISTRATOR"],
      },
      slashCommand: {
        enabled: false,
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const targetChannel = message.mentions.channels.first();
    if (!targetChannel) return message.reply("Incorrect usage! You need to mention a target channel");
    if (!targetChannel.permissionsFor(message.guild.me).has()) {
      return message.reply(
        `You need the following permissions in ${targetChannel.toString()}\n${this.parsePermissions(channelPerms)}`
      );
    }

    let targetMessage;
    try {
      targetMessage = await targetChannel.messages.fetch(args[1]);
    } catch (ex) {
      return message.reply("Could not fetch message. Did you provide a valid messageId?");
    }

    try {
      await removeReactionRole(message.guild.id, targetChannel.id, targetMessage.id);
      targetMessage.reactions?.removeAll();
    } catch (ex) {
      return message.reply("Oops! An unexpected error occurred. Try again later");
    }

    message.channel.send("Done! Configuration updated");
  }
};
