const { Command } = require("@src/structures");
const { getEffectiveInvites } = require("@src/handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const outdent = require("outdent");
const { resolveMember } = require("@utils/guildUtils");
const { getMember } = require("@schemas/Member");
const { getSettings } = require("@schemas/Guild");

module.exports = class InviterCommand extends Command {
  constructor(client) {
    super(client, {
      name: "inviter",
      description: "shows inviter information",
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "[@member|id]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "the user to get the inviter information for",
            type: "USER",
            required: false,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const response = await getInviter(message, target.user);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInviter(interaction, user);
    await interaction.followUp(response);
  }
};

async function getInviter({ guild }, user) {
  const settings = await getSettings(guild);
  if (!settings.invite.tracking) return `Invite tracking is disabled in this server`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;
  if (!inviteData || !inviteData.inviter) return `Cannot track how \`${user.tag}\` joined`;

  const inviter = await guild.client.users.fetch(inviteData.inviter, false, true);
  const inviterData = (await getMember(guild.id, inviteData.inviter)).invite_data;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `Invite data for ${user.username}` })
    .setDescription(
      outdent`
      Inviter: \`${inviter?.tag || "Deleted User"}\`
      Inviter ID: \`${inviteData.inviter}\`
      Invite Code: \`${inviteData.code}\`
      Inviter Invites: \`${getEffectiveInvites(inviterData)}\`
      `
    );

  return { embeds: [embed] };
}
