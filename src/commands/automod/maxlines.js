const { Command } = require("@src/structures");
const { maxLines } = require("@schemas/guild-schema");
const { Message } = require("discord.js");

module.exports = class MaxLines extends Command {
  constructor(client) {
    super(client, {
      name: "maxlines",
      description: "sets maximum lines allowed per message",
      command: {
        enabled: true,
        usage: "<number>",
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
    let input = args[0];

    if (isNaN(input)) {
      if (input === "none" || input === "off") input = 0;
      else return message.reply("Not a valid input");
    }

    if (parseInt(input, 10) < 0) return message.reply("The maximum number of lines must be a positive integer!");

    await maxLines(message.guildId, input);
    message.channel.send(
      `${
        input === 0
          ? "Maximum line limit is disabled"
          : `Messages longer than \`${input}\` lines will now be automatically deleted`
      }`
    );
  }
};
