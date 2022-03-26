const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = class InviteRanks extends Command {
  constructor(client) {
    super(client, {
      name: "inviteranks",
      description: "shows the invite ranks configured on this guild",
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
      },
      slashCommand: {
        enabled: true,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const response = await getInviteRanks(message, data.settings);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const response = await getInviteRanks(interaction, data.settings);
    await interaction.followUp(response);
  }
};

async function getInviteRanks({ guild }, settings) {
  if (settings.invite.ranks.length === 0) return "No invite ranks configured in this server";
  let str = "";

  settings.invite.ranks.forEach((data) => {
    const roleName = guild.roles.cache.get(data._id)?.toString();
    if (roleName) {
      str += `❯ ${roleName}: ${data.invites} invites\n`;
    }
  });

  const embed = new MessageEmbed()
    .setAuthor({ name: "Invite Ranks" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(str);
  return { embeds: [embed] };
}
