const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getEffectiveInvites, checkInviteRewards } = require("@src/handlers/invite-handler");
const { getDetails, incrementInvites, clearInvites } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = class InvitesCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "invites",
      description: "shows number of invites in this server",
      enabled: true,
      category: "INVITE",
      options: [
        {
          name: "view",
          description: "view the number of invites",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to get the invites for",
              type: "USER",
              required: false,
            },
          ],
        },
        {
          name: "add",
          description: "add invites to a member [Requires Manage Server permission]",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to give invites to",
              type: "USER",
              required: true,
            },
            {
              name: "invites",
              description: "the number of invites to give",
              type: "INTEGER",
              required: true,
            },
          ],
        },
        {
          name: "reset",
          description: "clear previously added invites [Requires Manage Server permission]",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to clear invites for",
              type: "USER",
              required: true,
            },
          ],
        },
        {
          name: "import",
          description: "add existing guild invites to users [Requires Manage Server permission]",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "the user to import invites for",
              type: "USER",
              required: false,
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

    // view
    if (sub === "view") {
      const user = interaction.options.getUser("user") || interaction.user;

      const inviteData = await getDetails(interaction.guildId, user.id);
      if (!inviteData) return interaction.followUp(`No invite data found for \`${user.tag}\``);

      const embed = new MessageEmbed()
        .setAuthor(`Invites for ${user.username}`)
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`${user.toString()} has ${getEffectiveInvites(inviteData)} invites`)
        .addField("Total Invites", `**${inviteData?.tracked_invites + inviteData?.added_invites || 0}**`, true)
        .addField("Fake Invites", `**${inviteData?.fake_invites || 0}**`, true)
        .addField("Left Invites", `**${inviteData?.left_invites || 0}**`, true);

      return interaction.followUp({ embeds: [embed] });
    }

    // add invites
    else if (sub === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("invites");

      const inviteData = await incrementInvites(interaction.guildId, user.id, "ADDED", amount);

      const embed = new MessageEmbed()
        .setAuthor(`Added invites to ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(`${user.tag} now has ${getEffectiveInvites(inviteData)} invites`);

      await interaction.followUp({ embeds: [embed] });
      checkInviteRewards(interaction.guild, inviteData, true);
    }

    // remove invites
    else if (sub === "reset") {
      const user = interaction.options.getUser("user");
      await clearInvites(interaction.guildId, user.id);
      return interaction.followUp(`Done! Invites cleared for \`${user.tag}\``);
    }

    // import
    else if (sub === "import") {
      const target = interaction.options.getUser("user");
      const invites = await interaction.guild.invites.fetch({ cache: false });

      invites.forEach(async (invite) => {
        const user = invite.inviter;
        if (!user || invite.uses === 0) return; // No inviter
        if (target && user.id !== target.id) return; // Skipping non user
        await incrementInvites(interaction.guildId, user.id, "ADDED", invite.uses);
      });

      return interaction.followUp(`Done! Previous invites added to ${target ? target.tag : "all members"}`);
    }
  }
};
