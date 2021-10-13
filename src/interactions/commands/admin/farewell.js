const { CommandInteraction, Guild, GuildMember } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const db = require("@schemas/greeting-schema");
const { isHex } = require("@utils/miscUtils");
const { buildEmbed } = require("@src/handlers/greeting-handler");

module.exports = class Farewell extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "farewell",
      description: "setup farewell message",
      enabled: true,
      ephemeral: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      options: [
        {
          name: "status",
          description: "enable or disable farewell message",
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
          description: "preview the configured farewell message",
          type: "SUB_COMMAND",
        },
        {
          name: "channel",
          description: "set farewell channel",
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
      await db.setStatus(interaction.guildId, status, "farewell");
      return interaction.followUp("Configuration saved! Farewell message disabled");
    }

    // Preview
    else if (sub === "preview") {
      const data = farewellPreview(interaction.guild, interaction.member);
      return interaction.followUp(data);
    }

    // Channel
    else if (sub === "channel") {
      const target = interaction.options.getChannel("channel");
      if (target.type !== "GUILD_TEXT") return interaction.followUp("Target channel must be of type text");
      await db.setChannel(interaction.guildId, null, "farewell");
      return interaction.followUp(`Configuration saved! Farewell message is set to ${target}`);
    }

    // Description
    else if (sub === "desc") {
      const content = interaction.options.getString("content");
      await db.setDescription(interaction.guild.id, content, "farewell");
      interaction.followUp("Configuration saved! Farewell message updated");
    }

    // Thumbnail
    else if (sub === "thumbnail") {
      const status = interaction.options.getString("status") === "ON" ? true : false;
      await db.setThumbnail(interaction.guild.id, status, "farewell");
      interaction.followUp("Configuration saved! Farewell message updated");
    }

    // Color
    else if (sub === "color") {
      const color = interaction.options.getString("color");
      if (!isHex(color)) return interaction.followUp("Oops! That doesn't look like a valid HEX Color code");

      await db.setColor(interaction.guild.id, color, "farewell");
      interaction.followUp("Configuration saved! Farewell message updated");
    }

    // Footer
    else if (sub === "footer") {
      const content = interaction.options.getString("content");
      await db.setFooter(interaction.guild.id, content, "farewell");
      interaction.followUp("Configuration saved! Farewell message updated");
    }

    // return
    else return interaction.followUp("Not a valid sub-command");
  }
};

/**
 * @param {Guild} guild
 * @param {GuildMember} member
 */
const farewellPreview = async (guild, member) => {
  const config = (await db.getConfig(guild.id))?.farewell;
  if (!config || !config.enabled) return "Farewell message not enabled in this server";

  const targetChannel = guild.channels.cache.get(config.channel_id);
  if (!config.embed.description) {
    config.embed.description = "Goodbye {member:tag}!";
  }

  const embed = await buildEmbed(member, config?.embed);
  return {
    content: `Target Channel: ${targetChannel ? targetChannel.toString() : "Not found"}`,
    embeds: [embed],
  };
};
