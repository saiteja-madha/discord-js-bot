const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS } = require('@src/config.js')

// Amina's creative love responses
const loveResponses = {
  perfect: [
    "💖 OMG they're literally soulmates! The stars aligned! 💫",
    '✨ This is like something straight out of my favorite romance anime! ✨',
    "💝 My heart can't handle how perfect they are together! 💝",
  ],
  good: [
    "💕 Aww, they've got such sweet chemistry! 💕",
    "💫 I'm getting such good vibes from this match! ✨",
    '🌟 They could write a really cute love story together! 🌟',
  ],
  decent: [
    '💛 With a little magic, this could become something special! ✨',
    "🌟 There's potential here - just needs some sparkle! 🌟",
    '💫 I see a spark waiting to bloom! 💫',
  ],
  low: [
    '💜 Sometimes opposites attract in the most unexpected ways! 💫',
    "✨ Maybe they're better as adventure buddies! 🌟",
    '🎨 Every relationship is its own unique masterpiece! 💫',
  ],
}

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'love',
  description: 'Let me check the stars and see if love is in the air! ✨',
  category: 'FUN',
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'user1',
        description: 'First person in this potential love story! 💫',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'user2',
        description: 'Second person in this magical equation! ✨',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const user1 = interaction.options.getUser('user1')
    const user2 = interaction.options.getUser('user2')
    const response = await getUserLove(user1, user2, interaction.user)
    await interaction.followUp(response)
  },
}

async function getUserLove(user1, user2, mauthor) {
  const result = Math.ceil(Math.random() * 100)

  // Get a random response based on the result
  let loveStatus
  let customResponse
  if (result <= 20) {
    loveStatus = '💜 Friendship Stars 💜'
    customResponse =
      loveResponses.low[Math.floor(Math.random() * loveResponses.low.length)]
  } else if (result <= 50) {
    loveStatus = '💫 Potential Sparkles 💫'
    customResponse =
      loveResponses.decent[
        Math.floor(Math.random() * loveResponses.decent.length)
      ]
  } else if (result <= 80) {
    loveStatus = '💝 Love Blooming 💝'
    customResponse =
      loveResponses.good[Math.floor(Math.random() * loveResponses.good.length)]
  } else {
    loveStatus = '✨ Magical Match ✨'
    customResponse =
      loveResponses.perfect[
        Math.floor(Math.random() * loveResponses.perfect.length)
      ]
  }

  const loveImage =
    result >= 51
      ? 'https://media1.giphy.com/media/TmngSmlDjzJfO/giphy.gif?cid=ecf05e47brm0fzk1kan0ni753jmvvik6h27sp13fkn8a9kih&rid=giphy.gif&ct=g'
      : 'https://media4.giphy.com/media/SIPIe590rx6iA/giphy.gif?cid=ecf05e476u1ciogyg7rjw1aaoh29s912axi5r7b5r46fczx6&rid=giphy.gif&ct=g'

  const embed = new EmbedBuilder()
    .setTitle("💖 Amina's Love-O-Meter ✨")
    .setDescription("*wiggles eyebrows* Let's see what the love stars say! 💫")
    .addFields(
      {
        name: '💫 The Magic Result 💫',
        value: `**${user1}** and **${user2}** are a **${result}%** match!\n${customResponse}`,
        inline: false,
      },
      {
        name: '✨ Love Status ✨',
        value: loveStatus,
        inline: false,
      }
    )
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(loveImage)
    .setThumbnail('https://www.wownow.net.in/assets/images/love.gif')
    .setFooter({
      text: `Requested by ${mauthor.tag} (I ship it! 💖)`,
    })
    .setTimestamp()

  return { embeds: [embed] }
}
