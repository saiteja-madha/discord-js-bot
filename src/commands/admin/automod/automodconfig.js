const { Command } = require("@src/structures");
const { Message, MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { table } = require("table");

module.exports = class AutomodConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: "automodconfig",
      description: "various automod configuration",
      category: "AUTOMOD",
      userPermissions: ["MANAGE_GUILD"],
      command: {
        enabled: true,
        minArgsCount: 1,
        subcommands: [
          {
            trigger: "status",
            description: "check automod configuration for this guild",
          },
          {
            trigger: "strikes <number>",
            description: "maximum number of strikes a member can receive before taking an action",
          },
          {
            trigger: "action <MUTE|KICK|BAN>",
            description: "set action to be performed after receiving maximum strikes",
          },
          {
            trigger: "debug <ON|OFF>",
            description: "turns on automod for messages sent by admins and moderators",
          },
        ],
      },
      slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
          {
            name: "status",
            description: "Check automod configuration",
            type: "SUB_COMMAND",
          },
          {
            name: "strikes",
            description: "Set maximum number of strikes before taking an action",
            type: "SUB_COMMAND",
            options: [
              {
                name: "amount",
                description: "number of strikes (default 5)",
                required: true,
                type: "INTEGER",
              },
            ],
          },
          {
            name: "action",
            description: "Set action to be performed after receiving maximum strikes",
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
          {
            name: "debug",
            description: "Enable/disable automod for messages sent by admins & moderators",
            type: "SUB_COMMAND",
            options: [
              {
                name: "status",
                description: "configuration status",
                required: true,
                type: "STRING",
                choices: [
                  {
                    name: "ON",
                    value: "ON",
                  },
                  {
                    name: "OFF",
                    value: "OFF",
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
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const settings = data.settings;

    let response;
    if (input === "status") {
      response = await getStatus(settings, message.guild);
    } else if (input === "strikes") {
      const strikes = args[1];
      if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
        return message.safeReply("Strikes must be a valid number greater than 0");
      }
      response = await setStrikes(settings, strikes);
    } else if (input === "action") {
      const action = args[1].toUpperCase();
      if (!action || !["MUTE", "KICK", "BAN"].includes(action))
        return message.safeReply("Not a valid action. Action can be `Mute`/`Kick`/`Ban`");
      response = await setAction(settings, message.guild, action);
    } else if (input === "debug") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Invalid status. Value must be `on/off`");
      response = await setDebug(settings, status);
    }

    //
    else response = "Invalid command usage!";
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;

    // status
    if (sub === "status") response = await getStatus(settings, interaction.guild);
    else if (sub === "strikes") response = await setStrikes(settings, interaction.options.getInteger("amount"));
    else if (sub === "action")
      response = await setAction(settings, interaction.guild, interaction.options.getString("action"));
    else if (sub === "debug") response = await setDebug(settings, interaction.options.getString("status"));

    await interaction.followUp(response);
  }
};

async function getStatus(settings, guild) {
  const { automod } = settings;
  const row = [];

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : "Not Configured";

  row.push(["Max Lines", automod.max_lines || "NA"]);
  row.push(["Max Mentions", automod.max_mentions || "NA"]);
  row.push(["Max Role Mentions", automod.max_role_mentions || "NA"]);
  row.push(["Anti-Links", automod.anti_links ? "✓" : "✕"]);
  row.push(["Anti-Invites", automod.anti_invites ? "✓" : "✕"]);
  row.push(["Anti-Scam", automod.anti_scam ? "✓" : "✕"]);
  row.push(["Anti-Ghostping", automod.anti_ghostping ? "✓" : "✕"]);

  const asciiTable = table(row, {
    singleLine: true,
    header: {
      content: "Automod Configuration",
      alignment: "center",
    },
    columns: [
      {},
      {
        alignment: "center",
      },
    ],
  });

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription("```" + asciiTable + "```")
    .addField("Log Channel", logChannel, true)
    .addField("Max Strikes", automod.strikes.toString(), true)
    .addField("Action", automod.action, true);

  return { embeds: [embed] };
}

async function setStrikes(settings, strikes) {
  settings.automod.strikes = strikes;
  await settings.save();
  return `Configuration saved! Maximum strikes is set to ${strikes}`;
}

async function setAction(settings, guild, action) {
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

  settings.automod.action = action;
  await settings.save();
  return `Configuration saved! Automod action is set to ${action}`;
}

async function setDebug(settings, input) {
  const status = input.toLowerCase() === "on" ? true : false;
  settings.automod.debug = status;
  await settings.save();
  return `Configuration saved! Automod debug is now ${status ? "enabled" : "disabled"}`;
}
