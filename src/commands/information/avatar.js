const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const avatarInfo = require("./shared/avatar");

module.exports = class UserInfo extends Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "shows a users avatar information",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "[@member|id]",
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
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = avatarInfo(target.user);
    await message.reply(response);
  }
};
