const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS } = require('@src/config.js')

const NORMAL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789"
const FLIPPED =
  "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86"

const coinTossIntros = [
  '*bouncing excitedly* \nTime for a game of chance! 🎲',
  "*channels Player 001 energy* \nLet's play a little game~ 🦑",
  '*spins around* \nReady for some coin-flipping fun? ✨',
  '*giggles* \nYour fate is in my hands! Well, in this coin actually! 🎮',
  "*eyes sparkling* \nWill luck be on your side? Let's find out! 🍀",
]

const waitingMessages = [
  '*watching intensely like in Squid Game* \nThe suspense! 😱',
  '*holds breath dramatically* \nUp it goes! ✨',
  '*bouncing nervously* \nOh oh oh, where will it land?! 🎯',
  "*channel's Player 001's patience* \nJust a moment... 🦑",
  '*can barely contain excitement* \nAlmost there! 💫',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'flip',
  description: "Want to flip a coin or text? Let's play a fun game!",
  category: 'FUN',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'coin',
        description: "Ready to test your luck? Let's flip a coin!",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'text',
        description: "Let's turn your words upside down! ✨",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'input',
            description: 'What message should I flip for you? Make it fun! 🎨',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand('type')

    if (sub === 'coin') {
      const items = ['HEAD', 'TAIL']
      const toss = items[Math.floor(Math.random() * items.length)]
      await interaction.followUp({ embeds: [firstEmbed(interaction.user)] })

      setTimeout(() => {
        interaction.editReply({ embeds: [secondEmbed()] }).catch(() => {})
        setTimeout(() => {
          interaction.editReply({ embeds: [resultEmbed(toss)] }).catch(() => {})
        }, 2000)
      }, 2000)
    } else if (sub === 'text') {
      const input = interaction.options.getString('input')
      const response = await flipText(input)
      await interaction.followUp({
        content: `*giggles* Here's your text, but make it ✨chaos✨:\n${response}`,
      })
    }
  },
}

const firstEmbed = user => {
  const randomIntro =
    coinTossIntros[Math.floor(Math.random() * coinTossIntros.length)]
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(randomIntro)
    .setDescription(
      `${user.username} started a coin toss! Let's see what fate has in store! 🎲`
    )
    .setImage(
      'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW4ydjNmdWprcmJmbXEyZnhrN3piZHRscGNtaXVhaGlpMTFyeGwxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZR8teuiCs3AkSkzjnG/giphy.gif'
    )
}

const secondEmbed = () => {
  const randomWait =
    waitingMessages[Math.floor(Math.random() * waitingMessages.length)]
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(randomWait)
    .setImage(
      'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW4ydjNmdWprcmJmbXEyZnhrN3piZHRscGNtaXVhaGlpMTFyeGwxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZR8teuiCs3AkSkzjnG/giphy.gif'
    )
}

const resultEmbed = toss => {
  const winMessages = {
    HEAD: '*jumps with joy* The coin shows its face! ✨',
    TAIL: '*spins excitedly* The coin shows its tail! ✨',
  }

  return new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(winMessages[toss])
    .setDescription(`>> **${toss} Wins** <<`)
    .setImage(
      toss === 'HEAD'
        ? 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTh5ZXg3d3h1dWVnY2RsdXRjamp1ZnYwZHdmejQxcXFvZ213NXBvMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9uorwgUW3jFsY/giphy.gif'
        : 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXhpaXljMnFhcnRtOGVjZXM0OG9xZG10bWdudGl2OWk0MDdwdXFlZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dg/ixeyDqK6aao6WSdvpL/giphy.gif'
    )
}

async function flipText(text) {
  let builder = ''
  for (let i = 0; i < text.length; i += 1) {
    const letter = text.charAt(i)
    const a = NORMAL.indexOf(letter)
    builder += a !== -1 ? FLIPPED.charAt(a) : letter
  }
  return builder
}
