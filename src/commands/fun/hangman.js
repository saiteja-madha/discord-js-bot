const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')
const { Hangman } = require('discord-gamecord')
const { EMBED_COLORS } = require('@src/config.js')

// Themes with Amina's creative touch
const choices = [
  { name: 'nature', emoji: '🌿' },
  { name: 'sport', emoji: '⚽' },
  { name: 'color', emoji: '🎨' },
  { name: 'camp', emoji: '⛺' },
  { name: 'fruit', emoji: '🍎' },
  { name: 'discord', emoji: '💬' },
  { name: 'winter', emoji: '❄️' },
  { name: 'pokemon', emoji: '⭐' },
]

module.exports = {
  name: 'hangman',
  description:
    "Time for a word-guessing adventure! Pick a theme and let's play! 🎮",
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'theme',
        description: 'Choose your challenge theme!',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: choices.map(choice => ({
          name: `${choice.emoji} ${choice.name}`,
          value: choice.name,
        })),
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('theme')

    const Game = new Hangman({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: `🎯 Hangman: ${choice.charAt(0).toUpperCase() + choice.slice(1)} Theme`,
        color: EMBED_COLORS.WARNING,
      },
      hangman: {
        hat: '🎩',
        head: '🤔',
        shirt: '👕',
        pants: '🩳',
        boots: '👞👞',
      },
      timeoutTime: 60000,
      theme: choice,
      winMessage:
        "🎉 You did it! The word was **{word}**! You're amazing at this!",
      loseMessage:
        "Aww, not this time! The word was **{word}**. Let's try another round!",
      playerOnlyMessage:
        'Hey there! This game belongs to {player}! Start your own adventure with `/hangman` 💫',
    })

    Game.startGame()
    Game.on('gameOver', result => {
      if (result === 'win') {
        Game.win()
      } else if (result === 'lose') {
        Game.lose()
      }
    })
  },
}
