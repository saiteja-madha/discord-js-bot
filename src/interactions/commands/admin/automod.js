const { CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { getRoleByName } = require("@utils/guildUtils");
const { EMBED_COLORS } = require("@root/config");
const { getSettings } = require("@schemas/guild-schema");
const { table } = require("table");

module.exports = class Automod extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "automod",
      description: "various automod configuration",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      options: [
        {
          name: "antighostping",
          description: "Log ghost mentions in your server",
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
        {
          name: "antiinvites",
          description: "Allow or disallow sending discord invites in message",
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
        {
          name: "antilinks",
          description: "Allow or disallow sending links in message",
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
        {
          name: "antiscam",
          description: "Enable or disable antiscam detection",
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
        {
          name: "maxlines",
          description: "Sets maximum lines allowed per message",
          type: "SUB_COMMAND",
          options: [
            {
              name: "amount",
              description: "configuration amount (0 to disable)",
              required: true,
              type: "INTEGER",
            },
          ],
        },
        {
          name: "maxmentions",
          description: "Sets maximum user mentions allowed per message",
          type: "SUB_COMMAND",
          options: [
            {
              name: "amount",
              description: "configuration amount (0 to disable)",
              required: true,
              type: "INTEGER",
            },
          ],
        },
        {
          name: "maxrolementions",
          description: "Sets maximum role mentions allowed per message",
          type: "SUB_COMMAND",
          options: [
            {
              name: "amount",
              description: "configuration amount (0 to disable)",
              required: true,
              type: "INTEGER",
            },
          ],
        },
        {
          name: "config",
          description: "automod configuration",
          type: "SUB_COMMAND_GROUP",
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
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");

    const settings = await getSettings(interaction.guild);

    if (sub === "status") {
      const messagePayload = await automodStatus(interaction.guild, settings);
      return interaction.followUp(messagePayload);
    }

    if (sub === "strikes") {
      let strikes = interaction.options.getInteger("amount");
      settings.automod.strikes = strikes;
      await settings.save();
      return interaction.followUp(`Configuration saved! Maximum strikes is set to ${strikes}`);
    }

    if (sub === "action") {
      let action = interaction.options.getString("action");
      if (action === "MUTE") {
        let mutedRole = getRoleByName(interaction.guild, "muted");
        if (!mutedRole) {
          return interaction.followUp(`Muted role doesn't exist in this guild`);
        }

        if (!mutedRole.editable) {
          return interaction.followUp(
            "I do not have permission to move members to `Muted` role. Is that role below my highest role?"
          );
        }
      }

      settings.automod.action = action;
      await settings.save();
      return interaction.followUp(`Configuration saved! Automod action is set to ${action}`);
    }

    if (sub === "debug") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      settings.automod.debug = status;
      await settings.save();
      interaction.followUp(`Configuration saved! Automod debug is now ${status ? "enabled" : "disabled"}`);
    }

    if (sub === "antighostping") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      settings.automod.anti_ghostping = status;
      await settings.save();
      interaction.followUp(`Configuration saved! Antighost ping is now ${status ? "enabled" : "disabled"}`);
    }

    if (sub === "antiinvites") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      settings.automod.anti_invites = status;
      await settings.save();
      return interaction.followUp(
        `Messages ${
          status
            ? "with discord invites will now be automatically deleted"
            : "will not be filtered for discord invites now"
        }`
      );
    }

    if (sub === "antilinks") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      settings.automod.anti_links = status;
      await settings.save();
      return interaction.followUp(
        `Messages ${status ? "with links will now be automatically deleted" : "will not be filtered for links now"}`
      );
    }

    if (sub === "antiscam") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      settings.automod.anti_scam = status;
      await settings.save();
      return interaction.followUp(`Antiscam detection is now ${status ? "enabled" : "disabled"}`);
    }

    if (sub === "maxlines") {
      const input = interaction.options.getInteger("amount");
      settings.automod.max_lines = input;
      await settings.save();
      return interaction.followUp(
        `${
          input === 0
            ? "Maximum line limit is disabled"
            : `Messages longer than \`${input}\` lines will now be automatically deleted`
        }`
      );
    }

    if (sub === "maxmentions") {
      const input = interaction.options.getInteger("amount");
      settings.automod.max_mentions = input;
      await settings.save();
      return interaction.followUp(
        `${
          input === 0
            ? "Maximum user mentions limit is disabled"
            : `Messages having more than \`${input}\` user mentions will now be automatically deleted`
        }`
      );
    }

    if (sub === "maxrolementions") {
      const input = interaction.options.getInteger("amount");
      settings.automod.max_role_mentions = input;
      await settings.save();
      return interaction.followUp(
        `${
          input === 0
            ? "Maximum role mentions limit is disabled"
            : `Messages having more than \`${input}\` role mentions will now be automatically deleted`
        }`
      );
    }
  }
};

const automodStatus = async (guild, settings) => {
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
};
