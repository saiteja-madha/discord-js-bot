const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getUser, updateDailyStreak } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { diff_hours, getRemainingTime } = require("@utils/miscUtils");

module.exports = class DailyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "receive a daily bonus",
      category: "ECONOMY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const { member } = message;

    const user = await getUser(member.id);
    let streak = 0;

    if (user && user.daily.timestamp) {
      const lastUpdated = new Date(user.daily.timestamp);
      const difference = diff_hours(new Date(), lastUpdated);
      if (difference < 24) {
        const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
        return ctx.reply("You can again run this command in `" + getRemainingTime(nextUsage) + "`");
      }
      streak = user.daily.streak || streak;
      if (difference < 48) streak += 1;
      else streak = 0;
    }

    const updated = await updateDailyStreak(member.id, 100, streak);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(member.displayName, member.user.displayAvatarURL())
      .setDescription(
        "You got 100" + EMOJIS.CURRENCY + "as your daily reward\n" + "**Updated Balance:** " + updated?.coins ||
          0 + EMOJIS.CURRENCY
      );

    ctx.reply({ embeds: [embed] });
  }
};
