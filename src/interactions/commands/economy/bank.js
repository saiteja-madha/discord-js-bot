const { CommandInteraction, User, MessageEmbed } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { EMBED_COLORS, EMOJIS } = require("@root/config");
const { getUser, depositCoins, addCoins } = require("@schemas/user-schema");

module.exports = class Bank extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bank",
      description: "access to bank operations",
      enabled: true,
      category: "ECONOMY",
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
        {
          name: "transfer",
          description: "transfer coins to other user",
          type: "SUB_COMMAND",
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
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");
    let response;

    // balance
    if (sub === "balance") {
      response = await balance(interaction.user);
    }

    // deposit
    else if (sub === "deposit") {
      const coins = interaction.options.getInteger("coins");
      response = await deposit(interaction.user, coins);
    }

    // withdraw
    else if (sub === "withdraw") {
      const coins = interaction.options.getInteger("coins");
      response = await withdraw(interaction.user, coins);
    }

    // transfer
    else if (sub === "transfer") {
      response = await transfer(interaction);
    }

    await interaction.followUp(response);
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

/**
 *
 * @param {CommandInteraction} interaction
 */
const transfer = async (interaction) => {
  const self = interaction.user;
  const target = interaction.options.getUser("user");
  const coins = interaction.options.getInteger("coins");

  if (isNaN(coins) || coins <= 0) return "Please enter a valid amount of coins to transfer";
  if (target.user.bot) return "You cannot transfer coins to bots!";
  if (target.id === interaction.user.id) return "You cannot transfer coins to self!";

  const economy = await getUser(self.id);

  if (!economy || economy?.coins < coins) {
    return `Insufficient coin balance! You only have ${economy?.coins || 0}${EMOJIS.CURRENCY}`;
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

  return { embeds: [embed] };
};
