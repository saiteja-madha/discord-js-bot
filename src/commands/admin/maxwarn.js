const { Command } = require("@src/structures");
const { maxWarnings, maxWarnAction } = require("@schemas/guild-schema");
const { Message } = require("discord.js");
const { getRoleByName } = require("@utils/guildUtils");

module.exports = class MaxWarn extends Command {
  constructor(client) {
    super(client, {
      name: "maxwarn",
      description: "set max warnings configuration",
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "limit <number>",
            description: "set max warnings a member can receive before taking an action",
          },
          {
            trigger: "action <MUTE|KICK|BAN>",
            description: "set action to performed after receiving maximum warnings",
          },
        ],
        category: "ADMIN",
        userPermissions: ["ADMINISTRATOR"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args, invoke, prefix) {
    const input = args[0].toUpperCase();

    // Limit configuration
    if (input === "LIMIT") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1)
        return message.reply("Max Warnings must be a valid number greater than 0");

      await maxWarnings(message.guildId, max);
      message.channel.send(`Configuration saved! Maximum warnings is set to ${max}`);
    }

    // Action
    else if (input === "ACTION") {
      const action = args[1]?.toUpperCase();

      if (!action) message.reply("Please choose an action. Action can be `Mute`/`Kick`/`Ban`");
      if (!["MUTE", "KICK", "BAN"].includes(action))
        return message.reply("Not a valid action. Action can be `Mute`/`Kick`/`Ban`");

      if (action === "MUTE") {
        let mutedRole = getRoleByName(message.guild, "muted");
        if (!mutedRole) {
          return message.reply(`Muted role doesn't exist in this guild. Use \`${prefix}mute setup\` to create one`);
        }

        if (!mutedRole.editable) {
          return message.reply(
            "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
          );
        }
      }

      await maxWarnAction(message.guildId, action);
      message.channel.send(`Configuration saved! Max Warnings action is set to ${action}`);
    }

    // send usage
    else {
      return this.sendUsage(message.channel, prefix, invoke, "Incorrect Arguments");
    }
  }
};
