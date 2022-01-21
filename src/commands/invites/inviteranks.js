const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
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
   */
  async messageRun(message, args) {
    const response = await getInviteRanks(message);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const response = await getInviteRanks(interaction);
    await interaction.followUp(response);
  }
};

async function getInviteRanks({ guild }) {
  const settings = await getSettings(guild);

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
