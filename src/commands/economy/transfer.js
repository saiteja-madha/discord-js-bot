const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { getUser, addCoins } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Transfer extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      description: "transfer coins to other user",
      command: {
        enabled: true,
        usage: "<@member|id> <coins>",
        minArgsCount: 2,
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
    const coins = args[1];
    const target = await resolveMember(message, args[0], true);

    if (!target) return message.reply(`No user found matching ${args[0]}`);
    if (isNaN(coins) || coins <= 0) return message.reply("Please enter a valid amount of coins to transfer");
    if (target.user.bot) return message.reply("You cannot transfer coins to bots!");
    if (target.id === member.id) return message.reply("You cannot transfer coins to self!");

    const economy = await getUser(member.id);
    if (!economy || economy?.coins < coins)
      return message.reply(`Insufficient coin balance! You only have ${economy?.coins || 0}${EMOJIS.CURRENCY}`);

    const src = await addCoins(member.id, -coins);
    const des = await addCoins(target.id, coins);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("Updated Balance")
      .setDescription(
        `**${member.displayName}:** ${src.coins}${EMOJIS.CURRENCY}\n` +
          `**${target.displayName}:** ${des.coins}${EMOJIS.CURRENCY}`
      )
      .setTimestamp(Date.now());

    await message.channel.send({ embeds: [embed] });
  }
};
