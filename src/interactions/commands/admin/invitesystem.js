const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { inviteTracking, getSettings, removeInviteRank, addInviteRank } = require("@schemas/guild-schema");
const { cacheGuildInvites } = require("@src/handlers/invite-handler");

module.exports = class InviteSystem extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "invitesystem",
      description: "configure invite tracking in this server",
      enabled: true,
      userPermissions: ["MANAGE_GUILD"],
      category: "ADMIN",
      ephemeral: true,
      options: [
        {
          name: "enabled",
          description: "enable or disable invite tracking",
          type: "SUB_COMMAND",
          options: [
            {
              name: "status",
              description: "enable or disable invite tracking",
              type: "BOOLEAN",
              required: true,
            },
          ],
        },
        {
          name: "ranks",
          description: "configure invite ranks",
          type: "SUB_COMMAND_GROUP",
          options: [
            {
              name: "add",
              description: "add a new invite rank",
              type: "SUB_COMMAND",
              options: [
                {
                  name: "role",
                  description: "role to be given",
                  type: "ROLE",
                  required: true,
                },
                {
                  name: "invites",
                  description: "number of invites required to obtain the role",
                  type: "INTEGER",
                  required: true,
                },
              ],
            },
            {
              name: "remove",
              description: "remove a previously configured invite rank",
              type: "SUB_COMMAND",
              options: [
                {
                  name: "role",
                  description: "role with configured invite rank",
                  type: "ROLE",
                  required: true,
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

    // Invite Tracker
    if (sub === "enabled") {
      const status = interaction.options.getBoolean("status");

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

    // ranks add
    else if (sub === "add") {
      const settings = await getSettings(interaction.guild);
      const role = interaction.options.getRole("role");
      const invites = interaction.options.getInteger("invites");

      const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
      let msg = "";
      if (exists) {
        await removeInviteRank(interaction.guildId, role.id);
        msg += "Previous configuration found for this role. Overwriting data\n";
      }

      await addInviteRank(interaction.guildId, role.id, invites);
      return interaction.followUp(`${msg}Success! Configuration saved.`);
    }

    // ranks remove
    else if (sub === "remove") {
      const settings = await getSettings(interaction.guild);
      const role = interaction.options.getRole("role");

      const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
      if (!exists) return interaction.followUp("No previous invite rank is configured found for this role");

      await removeInviteRank(interaction.guildId, role.id);
      return interaction.followUp("Success! Configuration saved.");
    }
  }
};
