const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const emojiInfo = require("./shared/emoji");

module.exports = class EmojiInfo extends Command {
  constructor(client) {
    super(client, {
      name: "emojiinfo",
      description: "shows info about an emoji",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "<emoji>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const emoji = args[0];
    const response = emojiInfo(emoji);
    await message.reply(response);
  }
};
