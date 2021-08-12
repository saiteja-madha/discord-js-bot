const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { getConfig, updateDailyStreak } = require("@schemas/economy-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.json");
const outdent = require("outdent");

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

    const economy = await getConfig(message.channel.guild.id, member.id);
    let streak = 0;

    if (economy?.daily_timestamp) {
      const lastUpdated = new Date(economy?.daily_timestamp);
      const difference = diff_hours(new Date(), lastUpdated);
      if (difference < 24) {
        return ctx.reply("You can again run this command in `" + getTimeRemaining(lastUpdated) + "`");
      }
      streak = economy?.daily_streak || streak;
      if (difference < 48) streak += 1;
      else streak = 0;
    }

    const updated = await updateDailyStreak(message.channel.guild.id, member.id, 100, streak);

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

function diff_hours(dt2, dt1) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
}

/**
 *
 * @param {Date} lastUpdated
 * @returns
 */
function getTimeRemaining(lastUpdated) {
  lastUpdated.setHours(lastUpdated.getHours() + 24);
  const total = Date.parse(lastUpdated) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
}
