const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { xpSystem, inviteTracking, flagTranslation } = require("@schemas/guild-schema");
const { cacheGuildInvites } = require("@src/handlers/invite-handler");

module.exports = class FeaturesCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "feature",
      description: "enable or disable features in the server",
      enabled: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      ephemeral: true,
      options: [
        {
          name: "xp",
          description: "configure xp tracking in this guild",
          type: "SUB_COMMAND",
          options: [
            {
              name: "enabled",
              description: "enable or disable xp tracking",
              type: "BOOLEAN",
              required: true,
            },
          ],
        },
        {
          name: "invite",
          description: "configure invite tracking in this guild",
          type: "SUB_COMMAND",
          options: [
            {
              name: "enabled",
              description: "enable or disable invite tracking",
              type: "BOOLEAN",
              required: true,
            },
          ],
        },
        {
          name: "flag_tr",
          description: "configure translation by flags in this guild",
          type: "SUB_COMMAND",
          options: [
            {
              name: "enabled",
              description: "enable or disable flag translation",
              type: "BOOLEAN",
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

    // XP Tracker
    if (sub === "xp") {
      const status = interaction.options.getBoolean("enabled");
      await xpSystem(interaction.guildId, status);
      await interaction.followUp(`Configuration saved! XP System is now ${status ? "enabled" : "disabled"}`);
    }

    // Invite Tracker
    else if (sub === "invite") {
      const status = interaction.options.getBoolean("enabled");

      if (status) {
        if (!interaction.guild.me.permissions.has(["MANAGE_GUILD", "MANAGE_CHANNELS"])) {
          return interaction.followUp(
            "Oops! I am missing `Manage Server`, `Manage Channels` permission!\nI cannot track invites"
          );
        }

        const channelMissing = interaction.guild.channels.cache
          .filter((ch) => ch.type === "GUILD_TEXT" && !ch.permissionsFor(interaction.guild.me).has("MANAGE_CHANNELS"))
          .map((ch) => ch.name);

        if (channelMissing.length > 1) {
          return interaction.followUp(
            `I may not be able to track invites properly\nI am missing \`Manage Channel\` permission in the following channels \`\`\`${channelMissing.join(
              ", "
            )}\`\`\``
          );
        }

        await cacheGuildInvites(interaction.guild);
      } else {
        this.client.inviteCache.delete(interaction.guildId);
      }

      await inviteTracking(interaction.guildId, status);
      await interaction.followUp(`Configuration saved! Invite tracking is now ${status ? "enabled" : "disabled"}`);
    }

    // flag translation
    else if (sub === "flag_tr") {
      const status = interaction.options.getBoolean("enabled");
      await flagTranslation(interaction.guildId, status);
      await interaction.followUp(`Configuration saved! Flag translation is now ${status ? "enabled" : "disabled"}`);
    }
  }
};
