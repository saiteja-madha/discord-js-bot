const { Command } = require("@src/structures");
const { getSettings, maxStrikes, automodAction, automodDebug } = require("@schemas/guild-schema");
const { getRoleByName } = require("@utils/guildUtils");
const { Message, MessageEmbed } = require("discord.js");
const Ascii = require("ascii-table");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");

module.exports = class Automod extends Command {
  constructor(client) {
    super(client, {
      name: "automod",
      description: "various automod configuration",
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
        category: "AUTOMOD",
        userPermissions: ["ADMINISTRATOR"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args, invoke, prefix) {
    switch (args[0].toLowerCase()) {
      case "status":
        return await setStatus(message, args);

      case "strikes":
        return await setStrikes(message, args);

      case "action":
        return await setAction(message, args, prefix);

      case "debug":
        return await setDebug(message, args);

      default:
        return this.sendUsage(message.channel, prefix, invoke, "Incorrect Arguments");
    }
  }
};

async function setStatus(message, args) {
  const settings = await getSettings(message.guild);
  const { automod } = settings;

  const table = new Ascii("").setHeading("Feature", "Status");
  const logChannel = settings.modlog_channel
    ? message.guild.channels.cache.get(settings.modlog_channel).toString()
    : "Not Configured";

  table
    .addRow("Max Lines", automod.max_lines || "NA")
    .addRow("Max Mentions", automod.max_mentions || "NA")
    .addRow("Max Role Mentions", automod.max_role_mentions || "NA")
    .addRow("AntiLinks", automod.anti_links ? EMOJIS.TICK : EMOJIS.X_MARK)
    .addRow("AntiScam", automod.anti_scam ? EMOJIS.TICK : EMOJIS.X_MARK)
    .addRow("AntiInvites", automod.anti_invites ? EMOJIS.TICK : EMOJIS.X_MARK)
    .addRow("AntiGhostPing", automod.anti_ghostping ? EMOJIS.TICK : EMOJIS.X_MARK);

  const embed = new MessageEmbed()
    .setAuthor("Automod Configuration")
    .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
    .setDescription("```" + table.toString() + "```");

  message.channel.send({ content: `**Log Channel:** ${logChannel}`, embeds: [embed] });
}

async function setStrikes(message, args) {
  const strikes = args[1];

  if (isNaN(strikes) || Number.parseInt(strikes) < 1)
    return message.reply("Strikes must be a valid number greater than 0");

  await maxStrikes(message.guildId, strikes);
  message.channel.send(`Configuration saved! Maximum strikes is set to ${strikes}`);
}

async function setAction(message, args, prefix) {
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

  await automodAction(message.guildId, action);
  message.channel.send(`Configuration saved! Automod action is set to ${action}`);
}

async function setDebug(message, args) {
  const input = args[1]?.toLowerCase();
  if (!input) return message.reply(`Missing arguments. You need to provide \`on/off\``);

  let status;
  if (input === "on") status = true;
  else if (input === "off") status = false;
  else return message.reply(`Incorrect arguments. You need to provide \`on/off\``);

  await automodDebug(message.guildId, status);
  message.channel.send(`Configuration saved! Automod debug is now ${status ? "enabled" : "disabled"}`);
}
