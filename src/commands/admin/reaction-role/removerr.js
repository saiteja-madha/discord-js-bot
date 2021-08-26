const { removeReactionRole } = require("@root/src/schemas/reactionrole-schema");
const { Command, CommandContext } = require("@src/structures");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class RemoveReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "removerr",
      description: "remove configured reaction for the specified message",
      usage: "<#channel> <messageid>",
      minArgsCount: 2,
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;

    const targetChannel = message.mentions.channels.first();
    if (!targetChannel) return message.reply("Incorrect usage! You need to mention a target channel");
    if (!targetChannel.permissionsFor(message.guild.me).has()) {
      return message.reply(
        "You need the following permissions in " + targetChannel.toString() + "\n" + this.parsePermissions(channelPerms)
      );
    }

    let targetMessage;
    try {
      targetMessage = await targetChannel.messages.fetch(ctx.args[1]);
    } catch (ex) {
      return message.reply("Could not fetch message. Did you provide a valid messageId?");
    }

    try {
      await removeReactionRole(message.guild.id, targetChannel.id, targetMessage.id);
      targetMessage.reactions?.removeAll();
    } catch (ex) {
      return message.reply("Oops! An unexpected error occurred. Try again later");
    }

    ctx.reply("Done! Configuration updated");
  }
};
