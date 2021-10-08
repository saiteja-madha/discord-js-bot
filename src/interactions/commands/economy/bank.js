const { CommandInteraction, CommandInteractionOptionResolver, User, MessageEmbed } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { EMBED_COLORS, EMOJIS } = require("@root/config");
const { getUser, depositCoins } = require("@schemas/user-schema");

module.exports = class Bank extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bank",
      description: "access to bank operations",
      enabled: true,
      options: [
        {
          name: "balance",
          description: "check your account balance",
          type: "SUB_COMMAND",
          options: [
            {
              name: "user",
              description: "name of the user",
              type: "USER",
              required: false,
            },
          ],
        },
        {
          name: "deposit",
          description: "deposit coins to your bank account",
          type: "SUB_COMMAND",
          options: [
            {
              name: "coins",
              description: "number of coins to deposit",
              type: "INTEGER",
              required: true,
            },
          ],
        },
        {
          name: "withdraw",
          description: "withdraw coins from your bank account",
          type: "SUB_COMMAND",
          options: [
            {
              name: "coins",
              description: "number of coins to withdraw",
              type: "INTEGER",
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async run(interaction, options) {
    const sub = options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");
    let response;

    // balance
    if (sub === "balance") {
      response = await balance(interaction.user);
    }

    // deposit
    else if (sub === "deposit") {
      const coins = options.getInteger("coins");
      response = await deposit(interaction.user, coins);
    }

    // withdraw
    else if (sub === "withdraw") {
      const coins = options.getInteger("coins");
      response = await withdraw(interaction.user, coins);
    }

    return interaction.followUp(response);
  }
};

/**
 * @param {User} user
 */
const balance = async (user) => {
  const economy = await getUser(user.id);

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor(user.username)
    .setThumbnail(user.displayAvatarURL())
    .addField("Wallet", `${economy?.coins || 0}${EMOJIS.CURRENCY}`, true)
    .addField("Bank", `${economy?.bank || 0}${EMOJIS.CURRENCY}`, true)
    .addField("Net Worth", `${(economy?.coins || 0) + (economy?.bank || 0)}${EMOJIS.CURRENCY}`, true);

  return { embeds: [embed] };
};

/**
 * @param {User} user
 * @param {number} coins
 */
const withdraw = async (user, coins) => {
  if (isNaN(coins) || coins <= 0) return "Please enter a valid amount of coins to deposit";
  const economy = await getUser(user.id);
  const available = economy?.bank || 0;

  if (coins > available) return `You only have ${available}${EMOJIS.CURRENCY} coins in your bank`;
  const newBal = await depositCoins(user.id, -coins);

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor("New Balance")
    .setThumbnail(user.displayAvatarURL())
    .addField("Wallet", `${newBal?.coins || 0}${EMOJIS.CURRENCY}`, true)
    .addField("Bank", `${newBal?.bank || 0}${EMOJIS.CURRENCY}`, true)
    .addField("Net Worth", `${(newBal?.coins || 0) + (newBal?.bank || 0)}${EMOJIS.CURRENCY}`, true);

  return { embeds: [embed] };
};

/**
 * @param {User} user
 * @param {number} coins
 */
const deposit = async (user, coins) => {
  if (isNaN(coins) || coins <= 0) return "Please enter a valid amount of coins to deposit";
  const economy = await getUser(user.id);
  const available = economy?.coins || 0;

  if (coins > available) return `You only have ${available}${EMOJIS.CURRENCY} coins in your wallet`;

  const newBal = await depositCoins(user.id, coins);

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor("New Balance")
    .setThumbnail(user.displayAvatarURL())
    .addField("Wallet", `${newBal?.coins || 0}${EMOJIS.CURRENCY}`, true)
    .addField("Bank", `${newBal?.bank || 0}${EMOJIS.CURRENCY}`, true)
    .addField("Net Worth", `${(newBal?.coins || 0) + (newBal?.bank || 0)}${EMOJIS.CURRENCY}`, true);

  return { embeds: [embed] };
};
