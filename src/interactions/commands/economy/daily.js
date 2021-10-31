const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { getUser, updateDailyStreak } = require("@schemas/user-schema");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { diffHours, getRemainingTime } = require("@utils/miscUtils");

module.exports = class Daily extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "receive a daily bonus",
      enabled: true,
      category: "ECONOMY",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const user = await getUser(interaction.user.id);
    let streak = 0;

    if (user && user.daily.timestamp) {
      const lastUpdated = new Date(user.daily.timestamp);
      const difference = diffHours(new Date(), lastUpdated);
      if (difference < 24) {
        const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
        return interaction.followUp(`You can again run this command in \`${getRemainingTime(nextUsage)}\``);
      }
      streak = user.daily.streak || streak;
      if (difference < 48) streak += 1;
      else streak = 0;
    }

    const updated = await updateDailyStreak(interaction.user.id, ECONOMY.DAILY_COINS, streak);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
      .setDescription(
        `You got ${ECONOMY.DAILY_COINS}${ECONOMY.CURRENCY} as your daily reward\n` +
          `**Updated Balance:** ${updated?.coins || 0}${ECONOMY.CURRENCY}`
      );

    return interaction.followUp({ embeds: [embed] });
  }
};
