const { Command } = require("@src/structures");
const { Message } = require("discord.js");
const userInfo = require("../shared/user");

module.exports = class UserInfo extends Command {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "shows information about the user",
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "[@member|id]",
        aliases: ["uinfo", "memberinfo"],
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
    const response = userInfo(target);
    await message.reply(response);
  }
};
