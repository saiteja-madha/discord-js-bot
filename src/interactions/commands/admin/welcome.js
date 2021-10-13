const { CommandInteraction, GuildMember, Guild } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const db = require("@schemas/greeting-schema");
const { isHex } = require("@utils/miscUtils");
const { buildEmbed } = require("@src/handlers/greeting-handler");

module.exports = class Welcome extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "welcome",
      description: "setup welcome message",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      options: [
        {
          name: "status",
          description: "enable or disable welcome message",
          type: "SUB_COMMAND",
          options: [
            {
              name: "status",
              description: "enabled or disabled",
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
          name: "preview",
          description: "preview the configured welcome message",
          type: "SUB_COMMAND",
        },
        {
          name: "channel",
          description: "set welcome channel",
          type: "SUB_COMMAND",
          options: [
            {
              name: "channel",
              description: "channel name",
              type: "CHANNEL",
              required: true,
            },
          ],
        },
        {
          name: "desc",
          description: "set embed description",
          type: "SUB_COMMAND",
          options: [
            {
              name: "content",
              description: "description content",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "thumbnail",
          description: "configure embed thumbnail",
          type: "SUB_COMMAND",
          options: [
            {
              name: "status",
              description: "thumbnail status",
              type: "STRING",
              required: true,
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
          name: "color",
          description: "set embed color",
          type: "SUB_COMMAND",
          options: [
            {
              name: "hex-code",
              description: "hex color code",
              type: "STRING",
              required: true,
            },
          ],
        },
        {
          name: "footer",
          description: "set embed footer",
          type: "SUB_COMMAND",
          options: [
            {
              name: "content",
              description: "footer content",
              type: "STRING",
              required: true,
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

    if (sub === "status") {
      const status = interaction.options.getString("status") === "ON" ? true : false;
      await db.setStatus(interaction.guildId, status, "welcome");
      return interaction.followUp("Configuration saved! Welcome message disabled");
    }

    // Preview
    else if (sub === "preview") {
      const data = welcomePreview(interaction.guild, interaction.member);
      return interaction.followUp(data);
    }

    // Channel
    else if (sub === "channel") {
      const target = interaction.options.getChannel("channel");
      if (target.type !== "GUILD_TEXT") return interaction.followUp("Target channel must be of type text");
      await db.setChannel(interaction.guildId, null, "welcome");
      return interaction.followUp(`Configuration saved! Welcome message is set to ${target}`);
    }

    // Description
    else if (sub === "desc") {
      const content = interaction.options.getString("content");
      await db.setDescription(interaction.guild.id, content, "welcome");
      return interaction.followUp("Configuration saved! Welcome message updated");
    }

    // Thumbnail
    else if (sub === "thumbnail") {
      const status = interaction.options.getString("status") === "ON" ? true : false;
      await db.setThumbnail(interaction.guild.id, status, "welcome");
      return interaction.followUp("Configuration saved! Welcome message updated");
    }

    // Color
    else if (sub === "color") {
      const color = interaction.options.getString("color");
      if (!isHex(color)) return interaction.followUp("Oops! That doesn't look like a valid HEX Color code");

      await db.setColor(interaction.guild.id, color, "welcome");
      return interaction.followUp("Configuration saved! Welcome message updated");
    }

    // Footer
    else if (sub === "footer") {
      const content = interaction.options.getString("content");
      await db.setFooter(interaction.guild.id, content, "welcome");
      return interaction.followUp("Configuration saved! Welcome message updated");
    }

    // return
    else return interaction.followUp("Not a valid sub-command");
  }
};

/**
 * @param {Guild} guild
 * @param {GuildMember} member
 */
const welcomePreview = async (guild, member) => {
  const config = (await db.getConfig(guild.id))?.welcome;
  if (!config || !config.enabled) return "Welcome message not enabled in this server";

  const targetChannel = guild.channels.cache.get(config.channel_id);
  if (!config.embed.description) {
    config.embed.description = "Welcome to the server {member:name}";
  }

  const embed = await buildEmbed(member, config?.embed);
  return {
    content: `Target Channel: ${targetChannel ? targetChannel.toString() : "Not found"}`,
    embeds: [embed],
  };
};
