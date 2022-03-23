const { Command } = require("@src/structures");
const { getEffectiveInvites, checkInviteRewards } = require("@src/handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");
const { getMember } = require("@schemas/Member");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addinvites",
      description: "add invites to a member",
      category: "INVITE",
      userPermissions: ["MANAGE_GUILD"],
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "<@member|id> <invites>",
        minArgsCount: 2,
      },
      slashCommand: {
        enabled: true,
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
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = await resolveMember(message, args[0], true);
    const amount = parseInt(args[1]);

    if (!target) return message.safeReply("Incorrect syntax. You must mention a target");
    if (isNaN(amount)) return message.safeReply("Invite amount must be a number");

    const response = await addInvites(message, target.user, parseInt(amount));
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("invites");
    const response = await addInvites(interaction, user, amount);
    await interaction.followUp(response);
  }
};

async function addInvites({ guild }, user, amount) {
  if (user.bot) return "Oops! You cannot add invites to bots";

  const memberDb = await getMember(guild.id, user.id);
  memberDb.invite_data.added += amount;
  await memberDb.save();

  const embed = new MessageEmbed()
    .setAuthor({ name: `Added invites to ${user.username}` })
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`${user.tag} now has ${getEffectiveInvites(memberDb.invite_data)} invites`);

  checkInviteRewards(guild, memberDb, true);
  return { embeds: [embed] };
}
