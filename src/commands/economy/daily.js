const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { getUser, updateDailyStreak } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { diffHours, getRemainingTime } = require("@utils/miscUtils");

module.exports = class DailyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "receive a daily bonus",
      command: {
        enabled: true,
        category: "ECONOMY",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { member } = message;

    const user = await getUser(member.id);
    let streak = 0;

    if (user && user.daily.timestamp) {
      const lastUpdated = new Date(user.daily.timestamp);
      const difference = diffHours(new Date(), lastUpdated);
      if (difference < 24) {
        const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
        return message.reply(`You can again run this command in \`${getRemainingTime(nextUsage)}\``);
      }
      streak = user.daily.streak || streak;
      if (difference < 48) streak += 1;
      else streak = 0;
    }

    const updated = await updateDailyStreak(member.id, 1000, streak);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(member.displayName, member.user.displayAvatarURL())
      .setDescription(
        `You got 100${EMOJIS.CURRENCY} as your daily reward\n` +
          `**Updated Balance:** ${updated?.coins || 0}${EMOJIS.CURRENCY}`
      );

    message.channel.send({ embeds: [embed] });
  }
};
