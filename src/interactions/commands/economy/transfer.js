const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { getUser, addCoins } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");

module.exports = class Transfer extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "transfer",
      description: "transfer coins to other user",
      options: [
        {
          name: "user",
          description: "the user to whom coins must be transferred",
          type: "USER",
          required: true,
        },
        {
          name: "coins",
          description: "the amount of coins to transfer",
          type: "INTEGER",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const self = interaction.user;
    const target = interaction.options.getUser("user");
    const coins = interaction.options.getInteger("coins");

    if (isNaN(coins) || coins <= 0) return interaction.followUp("Please enter a valid amount of coins to transfer");
    if (target.user.bot) return interaction.followUp("You cannot transfer coins to bots!");
    if (target.id === interaction.user.id) return interaction.followUp("You cannot transfer coins to self!");

    const economy = await getUser(self.id);

    if (!economy || economy?.coins < coins) {
      return interaction.followUp(`Insufficient coin balance! You only have ${economy?.coins || 0}${EMOJIS.CURRENCY}`);
    }

    const src = await addCoins(self.id, -coins);
    const des = await addCoins(target.id, coins);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("Updated Balance")
      .setDescription(
        `**${self.username}:** ${src.coins}${EMOJIS.CURRENCY}\n` +
          `**${target.username}:** ${des.coins}${EMOJIS.CURRENCY}`
      )
      .setTimestamp(Date.now());

    return interaction.followUp({ embeds: [embed] });
  }
};
