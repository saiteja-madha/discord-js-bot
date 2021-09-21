const { Command } = require("@src/structures");
const { xpSystem } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class XPSystem extends Command {
  constructor(client) {
    super(client, {
      name: "xpsystem",
      description: "enable or disable XP ranking system in the server",
      command: {
        enabled: true,
        usage: "<ON|OFF>",
        minArgsCount: 1,
        aliases: ["xptracking"],
        category: "ADMIN",
        userPermissions: ["ADMINISTRATOR"],
      },
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

    await xpSystem(message.guildId, status);
    message.channel.send(`Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`);
  }
};
