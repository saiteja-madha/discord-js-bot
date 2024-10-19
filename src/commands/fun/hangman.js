const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')
const { Hangman } = require('discord-gamecord')

const choices = [
  'nature',
  'sport',
  'color',
  'camp',
  'fruit',
  'discord',
  'winter',
  'pokemon',
]

module.exports = {
  name: 'hangman',
  description: 'Play hangman in Discord',
  global: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'theme',
        description: 'Select a theme',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: choices.map(choice => {
          return {
            name: choice,
            value: choice,
          }
        }),
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('theme')

    const Game = new Hangman({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: 'Hangman',
        color: '#5865F2',
      },
      hangman: {
        hat: '🎩',
        head: '😟',
        shirt: '👕',
        pants: '🩳',
        boots: '👞👞',
      },
      timeoutTime: 60000,
      theme: choice,
      winMessage: 'You won! The word was **{word}**.',
      loseMessage: 'You lost! The word was **{word}**.',
      playerOnlyMessage: 'Only {player} can use these buttons.',
    })

    Game.startGame()
    Game.on('gameOver', result => {
      console.log(result) // =>  { result... }
    })
  },
}
