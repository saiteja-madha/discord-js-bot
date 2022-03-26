const { Command } = require("@src/structures");
const { Message, CommandInteraction, MessageEmbed } = require("discord.js");
const { getUser } = require("@schemas/User");
const { getMember } = require("@schemas/Member");
const { EMBED_COLORS, ECONOMY } = require("@root/config");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Profile extends Command {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "shows members profile",
      cooldown: 5,
      category: "INFORMATION",
      command: {
        enabled: true,
        usage: "[@member|id]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "target user",
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
   * @param {object} data
   */
  async messageRun(message, args, data) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const response = await profile(message, target.user, data.settings);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {object} data
   */
  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await profile(interaction, user, data.settings);
    await interaction.followUp(response);
  }
};

async function profile({ guild }, user, settings) {
  const memberData = await getMember(guild.id, user.id);
  const userData = await getUser(user.id);

  const embed = new MessageEmbed()
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addField("User Tag", user.tag, true)
    .addField("ID", user.id, true)
    .addField("Discord Registered", user.createdAt.toDateString(), false)
    .addField("Cash", `${userData.coins} ${ECONOMY.CURRENCY}`, true)
    .addField("Bank", `${userData.bank} ${ECONOMY.CURRENCY}`, true)
    .addField("Net Worth", `${userData.coins + userData.bank}${ECONOMY.CURRENCY}`, true)
    .addField("Reputation", `${userData.reputation.received}`, true)
    .addField("Daily Streak", `${userData.daily.streak}`, true)
    .addField("XP*", `${settings.ranking.enabled ? memberData.xp + " " : "Not Tracked"}`, true)
    .addField("Level*", `${settings.ranking.enabled ? memberData.level + " " : "Not Tracked"}`, true)
    .addField("Strikes*", memberData.strikes + " ", true)
    .addField("Warnings*", memberData.warnings + " ", true)
    .addField("Avatar-URL", user.displayAvatarURL({ format: "png" }))
    .setFooter({ text: "Fields marked (*) are guild specific" });

  return { embeds: [embed] };
}
