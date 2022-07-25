const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "maxwarn",
  description: "set max warnings configuration",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "limit <number>",
        description: "set max warnings a member can receive before taking an action",
      },
      {
        trigger: "action <timeout|kick|ban>",
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
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "max number of strikes",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "action",
        description: "set action to performed after receiving maximum warnings",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "action",
            description: "action to perform",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "TIMEOUT",
                value: "TIMEOUT",
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

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["limit", "action"].includes(input)) return message.safeReply("Invalid command usage");

    let response;
    if (input === "limit") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1) return message.safeReply("Max Warnings must be a valid number greater than 0");
      response = await setLimit(max, data.settings);
    }

    if (input === "action") {
      const action = args[1]?.toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Not a valid action. Action can be `Timeout`/`Kick`/`Ban`");
      response = await setAction(message.guild, action, data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "limit") {
      response = await setLimit(interaction.options.getInteger("amount"), data.settings);
    }

    if (sub === "action") {
      response = await setAction(interaction.guild, interaction.options.getString("action"), data.settings);
    }

    await interaction.followUp(response);
  },
};

async function setLimit(limit, settings) {
  settings.max_warn.limit = limit;
  await settings.save();
  return `Configuration saved! Maximum warnings is set to ${limit}`;
}

async function setAction(guild, action, settings) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "I do not permission to timeout members";
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "I do not have permission to kick members";
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "I do not have permission to ban members";
    }
  }

  settings.max_warn.action = action;
  await settings.save();
  return `Configuration saved! Automod action is set to ${action}`;
}
