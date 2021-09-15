const { Command } = require("@src/structures");
const { setPrefix } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class SetPrefix extends Command {
  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "sets a new prefix for this server",
      command: {
        enabled: true,
        usage: "<new-prefix>",
        minArgsCount: 1,
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
    const newPrefix = args[0];

    if (newPrefix.length > 2) return message.reply("Prefix length cannot exceed `2` characters");

    await setPrefix(message.guildId, newPrefix);
    message.reply(`New prefix has been set to \`${newPrefix}\``);
  }
};
