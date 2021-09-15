const { Command } = require("@src/structures");
const { antiInvites } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class AntiInvites extends Command {
  constructor(client) {
    super(client, {
      name: "antiinvites",
      description: "Allow or disallow sending discord invites in message",
      command: {
        enabled: true,
        usage: "<ON|OFF>",
        minArgsCount: 1,
        category: "AUTOMOD",
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
    const input = args[0].toLowerCase();
    let status;

    if (input === "none" || input === "off" || input === "disable") status = false;
    else if (input === "on" || input === "enable") status = true;
    else return message.reply("Incorrect Command Usage");

    await antiInvites(message.guildId, status);
    message.channel.send(
      `Messages ${
        status
          ? "with discord invites will now be automatically deleted"
          : "will not be filtered for discord invites now"
      }`
    );
  }
};
