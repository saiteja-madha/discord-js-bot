const { TicTacToe } = require('discord-gamecord')
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'tictactoe',
  description: 'Play Tic Tac Toe with your friends',
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
        description: 'Select a user to play',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const Game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser('user'),
      embed: {
        title: 'Tic Tac Toe',
        color: '#5865F2',
        statusTitle: 'Status',
        overTitle: 'Game Over',
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
      turnMessage: "{emoji} | It's the turn of player **{player}**.",
      winMessage: '{emoji} | **{player}** won the Tic Tac Toe Game.',
      tieMessage: 'The game tied! No one won the game!',
      timeoutMessage: 'The game went unfinished! No one won the game!',
      playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.',
    })

    Game.startGame()
    Game.on('gameOver', result => {
      const winners = result.winner
      const winner = `<@${winners}>`
      if (result.result === 'tie') {
        const embed = new EmbedBuilder()
          .setTitle('Tic Tac Toe')
          .setDescription('The game tied! No one won the game!')
          .setColor('Red')
          .setTimestamp()
        interaction.followUp({ embeds: [embed] })
      } else if (result.result === 'win') {
        const embed = new EmbedBuilder()
          .setTitle('Tic Tac Toe')
          .setDescription(`${winner} won the Tic Tac Toe Game.`)
          .setColor('Green')
          .setTimestamp()

        interaction.followUp({ embeds: [embed] })
      }
    })
  },
}
