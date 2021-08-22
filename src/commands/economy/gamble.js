const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getUser, addCoins } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { getRandomInt } = require("@utils/miscUtils");

module.exports = class Gamble extends Command {
  constructor(client) {
    super(client, {
      name: "gamble",
      description: "try your luck by gambling",
      usage: "<amount>",
      minArgsCount: 1,
      aliases: ["slot"],
      category: "ECONOMY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;
    const { member } = message;
    const betAmount = args[0];

    if (isNaN(betAmount)) return message.reply("Bet amount needs to be a valid number input");
    if (betAmount < 0) return message.reply("Bet amount cannot be negative");
    if (betAmount < 10) return message.reply("Bet amount cannot be less than 10");

    const economy = await getUser(member.id);
    if (!economy || economy?.coins < betAmount)
      return message.reply(
        `You do not have sufficient coins to gamble!\n**Coin balance:** ${economy?.coins || 0}${EMOJIS.CURRENCY}`
      );

    let slot1 = getEmoji();
    let slot2 = getEmoji();
    let slot3 = getEmoji();

    let str = `
    **Gamble Amount:** ${betAmount}${EMOJIS.CURRENCY}
    **Multiplier:** 1.5x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ‎‎‎‎║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ║
    ╚══════════╝
    `;

    const reward = calculateReward(betAmount, slot1, slot2, slot3);
    const result = (reward > 0 ? "You won: " + reward : "You lost: " + betAmount) + EMOJIS.CURRENCY;
    const balance = reward - betAmount;

    try {
      const remaining = await addCoins(member.id, balance);
      const embed = new MessageEmbed()
        .setAuthor(member.displayName, member.user.displayAvatarURL())
        .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
        .setDescription(str)
        .setFooter(`${result}\nUpdated balance: ${remaining?.coins}${EMOJIS.CURRENCY}`);

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      ctx.reply("Failed to update coin balance");
    }
  }
};

function getEmoji() {
  const ran = getRandomInt(9);
  switch (ran) {
    case 1:
      return "\uD83C\uDF52";
    case 2:
      return "\uD83C\uDF4C";
    case 3:
      return "\uD83C\uDF51";
    case 4:
      return "\uD83C\uDF45";
    case 5:
      return "\uD83C\uDF49";
    case 6:
      return "\uD83C\uDF47";
    case 7:
      return "\uD83C\uDF53";
    case 8:
      return "\uD83C\uDF50";
    case 9:
      return "\uD83C\uDF4D";
    default:
      return "\uD83C\uDF52";
  }
}

function calculateReward(amount, var1, var2, var3) {
  if (var1 === var2 && var2.equals === var3) return 2.25 * amount;
  if (var1 === var2 || var2 === var3 || var1 === var3) return 1.5 * amount;
  else return 0;
}
