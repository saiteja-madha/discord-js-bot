const { EMBED_COLORS } = require('@root/src/config')
const { TicTacToe } = require('discord-gamecord')
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'tictactoe',
  description: 'Challenge someone to an epic game of Tic Tac Toe!',
  cooldown: 1,
  category: 'FUN',
  botPermissions: [
    'SendMessages',
    'EmbedLinks',
    'AddReactions',
    'ReadMessageHistory',
    'ManageMessages',
  ],
  slashCommand: {
    enabled: true,
    ephermal: false,
    options: [
      {
        name: 'user',
        description: 'Pick your worthy opponent! 🎯',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const opponent = interaction.options.getUser('user')

    // Check if opponent is a bot
    if (opponent.bot) {
      return interaction.followUp({
        content:
          "💫 Oopsie! Bots can't play games yet - trust me, I've tried teaching them! Pick a human friend instead! ✨",
        ephemeral: true,
      })
    }

    // Check if user is trying to play with themselves
    if (opponent.id === interaction.user.id) {
      return interaction.followUp({
        content:
          "✨ Hey silly! You can't play against yourself - where's the fun in that? Invite a friend to join the adventure! 🎮",
        ephemeral: true,
      })
    }

    const Game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: opponent,
      embed: {
        title: '✨ Tic Tac Toe Challenge! ✨',
        color: EMBED_COLORS.BOT_EMBED,
        statusTitle: '💫 Current Status',
        overTitle: '🎮 Game Over!',
      },
      emojis: {
        xButton: '❌',
        oButton: '🔵',
        blankButton: '➖',
      },
      mentionUser: true,
      timeoutTime: 60000,
      xButtonStyle: 'DANGER',
      oButtonStyle: 'PRIMARY',
      turnMessage:
        "{emoji} | *bounces excitedly* It's **{player}**'s turn to make a move! ✨",
      winMessage:
        '{emoji} | *jumps with joy* **{player}** won the game! That was amazing! 🎉',
      tieMessage: "*spins around* It's a tie! You're both equally awesome! 🌟",
      timeoutMessage:
        "*droops* Aww, the game timed out! Don't leave me hanging next time! 💫",
      playerOnlyMessage:
        'Hey there! Only {player} and {opponent} can play in this game! But you can start your own adventure with `/tictactoe`! ✨',
    })

    Game.startGame()
    Game.on('gameOver', result => {
      const winners = result.winner
      const winner = `<@${winners}>`

      if (result.result === 'tie') {
        const embed = new EmbedBuilder()
          .setTitle('🌟 Tic Tac Toe Results 🌟')
          .setDescription(
            "*spins in circles* What an amazing battle! It's a perfect tie! Both of you played brilliantly! ✨"
          )
          .setColor(EMBED_COLORS.ERROR) // Gold color for ties
          .setTimestamp()
        interaction.followUp({ embeds: [embed] })
      } else if (result.result === 'win') {
        const embed = new EmbedBuilder()
          .setTitle('🎉 Tic Tac Toe Champion! 🎉')
          .setDescription(
            `*jumps excitedly* Congratulations ${winner}! That was an epic victory! 🌟`
          )
          .setColor(EMBED_COLORS.SUCCESS) // Green color for wins
          .setTimestamp()

        interaction.followUp({ embeds: [embed] })
      }
    })
  },
}
