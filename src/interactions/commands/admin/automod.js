const { CommandInteraction, MessageEmbed } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const db = require("@schemas/guild-schema");
const { getRoleByName } = require("@utils/guildUtils");
const { EMOJIS, EMBED_COLORS } = require("@root/config");
const Ascii = require("ascii-table");

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
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");

    //
    if (sub === "status") {
      const messagePayload = await automodStatus(interaction.guild);
      await interaction.followUp(messagePayload);
    }

    //
    else if (sub === "strikes") {
      let strikes = interaction.options.getInteger("amount");
      await db.maxStrikes(interaction.guildId, strikes);
      await interaction.followUp(`Configuration saved! Maximum strikes is set to ${strikes}`);
    }

    //
    else if (sub === "action") {
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

      await db.automodAction(interaction.guildId, action);
      interaction.followUp(`Configuration saved! Automod action is set to ${action}`);
    }

    //
    else if (sub === "debug") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      await db.automodDebug(interaction.guildId, status);
      interaction.followUp(`Configuration saved! Automod debug is now ${status ? "enabled" : "disabled"}`);
    }

    //
    else if (sub === "antighostping") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      await db.antiGhostPing(interaction.guildId, status);
      interaction.followUp(`Configuration saved! Antighost ping is now ${status ? "enabled" : "disabled"}`);
    }

    //
    else if (sub === "antiinvites") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      await db.antiInvites(interaction.guildId, status);
      interaction.followUp(
        `Messages ${
          status
            ? "with discord invites will now be automatically deleted"
            : "will not be filtered for discord invites now"
        }`
      );
    }

    //
    else if (sub === "antilinks") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      await db.antiLinks(interaction.guildId, status);
      interaction.followUp(
        `Messages ${status ? "with links will now be automatically deleted" : "will not be filtered for links now"}`
      );
    }

    //
    else if (sub === "antiscam") {
      let status = interaction.options.getString("status") === "ON" ? true : false;
      await db.antiScam(interaction.guildId, status);
      interaction.followUp(`Antiscam detection is now ${status ? "enabled" : "disabled"}`);
    }

    //
    else if (sub === "maxlines") {
      const input = interaction.options.getInteger("amount");
      await db.maxLines(interaction.guildId, input);
      interaction.followUp(
        `${
          input === 0
            ? "Maximum line limit is disabled"
            : `Messages longer than \`${input}\` lines will now be automatically deleted`
        }`
      );
    }

    //
    else if (sub === "maxmentions") {
      const input = interaction.options.getInteger("amount");
      await db.maxMentions(interaction.guildId, input);
      interaction.followUp(
        `${
          input === 0
            ? "Maximum user mentions limit is disabled"
            : `Messages having more than \`${input}\` user mentions will now be automatically deleted`
        }`
      );
    }

    //
    else if (sub === "maxrolementions") {
      const input = interaction.options.getInteger("amount");
      await db.maxMentions(interaction.guildId, input);
      interaction.followUp(
        `${
          input === 0
            ? "Maximum role mentions limit is disabled"
            : `Messages having more than \`${input}\` role mentions will now be automatically deleted`
        }`
      );
    }
  }
};

const automodStatus = async (guild) => {
  const settings = await db.getSettings(guild);
  const { automod } = settings;

  const table = new Ascii("").setHeading("Feature", "Status");
  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
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

  return { content: `**Log Channel:** ${logChannel}`, embeds: [embed] };
};
