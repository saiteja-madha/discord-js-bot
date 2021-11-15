const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const botinvite = require("./shared/botinvite");

module.exports = class BotInvite extends Command {
  constructor(client) {
    super(client, {
      name: "botinvite",
      description: "gives you bot invite",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
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
    const response = botinvite(message.client);
    try {
      await message.author.send(response);
      return message.reply("Check your DM for my information! :envelope_with_arrow:");
    } catch (ex) {
      return message.reply("I cannot send you my information! Is your DM open?");
    }
  }
};
