const { Command, CommandContext } = require("@root/command");
const { MessageEmbed } = require("discord.js");
const { getConfig, addCoins } = require("@schemas/economy-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.json");
const outdent = require("outdent");
const { getMember } = require("@utils/botUtils");

module.exports = class Transfer extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      description: "transfer coins to other user",
      usage: "<coins> <@member|id>",
      minArgsCount: 2,
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
    const coins = args[0];
    const target = await getMember(message, args[1], true);

    if (!target) return message.reply(`No user found matching ${args[1]}`);
    if (isNaN(coins) || coins <= 0) return message.reply("Please enter a valid amount of coins to transfer");
    if (target.user.bot) return message.reply("You cannot transfer coins to bots!");
    if (target.id === member.id) return message.reply("You cannot transfer coins to self!");

    const economy = await getConfig(guild.id, member.id);
    if (!economy || economy?.coins < coins)
      return message.reply(`Insufficient coin balance! You only have ${economy?.coins || 0}${EMOJIS.CURRENCY}`);

    try {
      const src = await addCoins(guild.id, member.id, -coins);
      const des = await addCoins(guild.id, target.id, coins);

      const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setAuthor("Coins Transferred")
        .setDescription(outdent`**Updated Balance:**
          **${member.displayName}:** ${src.coins}${EMOJIS.CURRENCY}
          **${target.displayName}:** ${des.coins}${EMOJIS.CURRENCY}
          `);

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      message.reply("Failed to transfer coins");
    }
  }
};
