const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getSettings, removeInviteRank, addInviteRank } = require("@schemas/guild-schema");
const { EMBED_COLORS } = require("@root/config");

module.exports = class InviteRanks extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "inviteranks",
      description: "view and configure invite ranks",
      enabled: true,
      category: "INVITE",
      options: [
        {
          name: "view",
          description: "shows invite ranks configured in this server",
          type: "SUB_COMMAND",
        },
        {
          name: "add",
          description: "add a new invite rank [Requires Manage Server permission]",
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
          description: "remove a previously configured invite rank [Requires Manage Server permission]",
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
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const self = await interaction.guild.members.fetch(interaction.user.id);
    const sub = interaction.options.getSubcommand();
    const settings = await getSettings(interaction.guild);

    // view
    if (sub === "view") {
      if (settings.invite.ranks.length === 0) return interaction.followUp("No invite ranks configured in this server");
      let str = "";

      settings.invite.ranks.forEach((data) => {
        const roleName = interaction.guild.roles.cache.get(data._id)?.toString();
        if (roleName) {
          str += `${roleName}: ${data.invites} invites\n`;
        }
      });

      const embed = new MessageEmbed().setAuthor("Invite Ranks").setColor(EMBED_COLORS.BOT_EMBED).setDescription(str);
      return interaction.followUp({ embeds: [embed] });
    }

    // add invite rank
    else if (sub === "add") {
      if (!self.permissions.has("MANAGE_GUILD")) {
        return interaction.followUp(`This command requires ${this.parsePermissions("MANAGE_GUILD")}`);
      }

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

    // remove invite rank
    else if (sub === "remove") {
      if (!self.permissions.has("MANAGE_GUILD")) {
        return interaction.followUp(`This command requires ${this.parsePermissions("MANAGE_GUILD")}`);
      }

      const role = interaction.options.getRole("role");

      const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
      if (!exists) return interaction.followUp("No previous invite rank is configured found for this role");

      await removeInviteRank(interaction.guildId, role.id);
      return interaction.followUp("Success! Configuration saved.");
    }
  }
};
