const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const guildInfo = require("./shared/guild");

module.exports = class GuildInfo extends Command {
  constructor(client) {
    super(client, {
      name: "guildinfo",
      description: "shows information about the server",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      cooldown: 5,
      command: {
        enabled: true,
        aliases: ["serverinfo"],
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
    const response = await guildInfo(message.guild);
    await message.reply(response);
  }
};
