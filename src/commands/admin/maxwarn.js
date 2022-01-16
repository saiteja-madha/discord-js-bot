const { Command } = require("@src/structures");
const { getSettings } = require("@schemas/Guild");
const { Message, CommandInteraction } = require("discord.js");

module.exports = class MaxWarn extends Command {
  constructor(client) {
    super(client, {
      name: "maxwarn",
      description: "set max warnings configuration",
      category: "ADMIN",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "limit <number>",
            description: "set max warnings a member can receive before taking an action",
          },
          {
            trigger: "action <mute|kick|ban>",
            description: "set action to performed after receiving maximum warnings",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "limit",
            description: "set max warnings a member can receive before taking an action",
            type: "SUB_COMMAND",
            options: [
              {
                name: "amount",
                description: "max number of strikes",
                type: "INTEGER",
                required: true,
              },
            ],
          },
          {
            name: "action",
            description: "set action to performed after receiving maximum warnings",
            type: "SUB_COMMAND",
            options: [
              {
                name: "action",
                description: "action to perform",
                type: "STRING",
                required: true,
                choices: [
                  {
                    name: "MUTE",
                    value: "MUTE",
                  },
                  {
                    name: "KICK",
                    value: "KICK",
                  },
                  {
                    name: "BAN",
                    value: "BAN",
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const input = args[0].toLowerCase();
    if (!["limit", "action"].includes(input)) return message.reply("Invalid command usage");

    let response;
    if (input === "limit") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1) return message.reply("Max Warnings must be a valid number greater than 0");
      response = await setLimit(message.guild, max);
    }

    if (input === "action") {
      const action = args[1]?.toUpperCase();
      if (!action || !["MUTE", "KICK", "BAN"].includes(action))
        return message.reply("Not a valid action. Action can be `Mute`/`Kick`/`Ban`");
      response = await setAction(message.guild, action);
    }

    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "limit") {
      response = await setLimit(interaction.guild, interaction.options.getInteger("amount"));
    }

    if (sub === "action") {
      response = await setAction(interaction.guild, interaction.options.getString("action"));
    }

    await interaction.followUp(response);
  }
};

async function setLimit(guild, limit) {
  const settings = await getSettings(guild);
  settings.max_warn.limit = limit;
  await settings.save();
  return `Configuration saved! Maximum warnings is set to ${limit}`;
}

async function setAction(guild, action) {
  if (action === "MUTE") {
    if (!guild.me.permissions.has("MODERATE_MEMBERS")) {
      return "I do not permission to timeout members";
    }
  }

  if (action === "KICK") {
    if (!guild.me.permissions.has("KICK_MEMBERS")) {
      return "I do not have permission to kick members";
    }
  }

  if (action === "BAN") {
    if (!guild.me.permissions.has("BAN_MEMBERS")) {
      return "I do not have permission to ban members";
    }
  }

  const settings = await getSettings(guild);
  settings.max_warn.action = action;
  await settings.save();
  return `Configuration saved! Automod action is set to ${action}`;
}
