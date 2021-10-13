const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { getEffectiveInvites } = require("@src/handlers/invite-handler");
const { getDetails } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const outdent = require("outdent");

module.exports = class InviterCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "inviter",
      description: "shows inviter information",
      enabled: true,
      category: "INVITE",
      options: [
        {
          name: "user",
          description: "the user to get the inviter information for",
          type: "USER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const inviteData = await getDetails(interaction.guildId, user.id);
    if (!inviteData || !inviteData.inviter_id) return interaction.followUp(`Cannot track how \`${user.tag}\` joined`);

    const inviter = await interaction.client.users.fetch(inviteData.inviter_id, false, true);
    const inviterData = await getDetails(interaction.guildId, inviteData.inviter_id);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(`Invite data for ${user.username}`)
      .setDescription(
        outdent`
      Inviter: \`${inviter?.tag || "Deleted User"}\`
      Inviter ID: \`${inviteData.inviter_id}\`
      Invite Code: \`${inviteData.invite_code}\`
      Inviter Invites: \`${getEffectiveInvites(inviterData)}\`
      `
      );

    await interaction.followUp({ embeds: [embed] });
  }
};
