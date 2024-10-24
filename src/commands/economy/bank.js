const { ApplicationCommandOptionType } = require('discord.js')
const balance = require('./sub/balance')
const deposit = require('./sub/deposit')
const transfer = require('./sub/transfer')
const withdraw = require('./sub/withdraw')
const { ECONOMY } = require('@root/config.js')
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'bank',
  description: 'access to bank operations',
  category: 'ECONOMY',
  botPermissions: ['EmbedLinks'],

  slashCommand: {
    enabled: ECONOMY.ENABLED,
    options: [
      {
        name: 'balance',
        description: 'check your coin balance',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'name of the user',
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: 'deposit',
        description: 'deposit coins to your bank account',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'coins',
            description: 'number of coins to deposit',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: 'withdraw',
        description: 'withdraw coins from your bank account',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'coins',
            description: 'number of coins to withdraw',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: 'transfer',
        description: 'transfer coins to other user',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'the user to whom coins must be transferred',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: 'coins',
            description: 'the amount of coins to transfer',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand()
    let response

    // balance
    if (sub === 'balance') {
      const user = interaction.options.getUser('user') || interaction.user
      response = await balance(user)
    }

    // deposit
    else if (sub === 'deposit') {
      const coins = interaction.options.getInteger('coins')
      response = await deposit(interaction.user, coins)
    }

    // withdraw
    else if (sub === 'withdraw') {
      const coins = interaction.options.getInteger('coins')
      response = await withdraw(interaction.user, coins)
    }

    // transfer
    else if (sub === 'transfer') {
      const user = interaction.options.getUser('user')
      const coins = interaction.options.getInteger('coins')
      response = await transfer(interaction.user, user, coins)
    }

    await interaction.followUp(response)
  },
}
