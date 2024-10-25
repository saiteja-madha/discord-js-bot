const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS } = require('@src/config.js')
const { getJson } = require('@helpers/HttpUtils')

// Amina's enthusiastic animal descriptions
const animalEmojis = {
  cat: '🐱',
  dog: '🐶',
  panda: '🐼',
  fox: '🦊',
  red_panda: '🔴🐼',
  koala: '🐨',
  bird: '🐦',
  raccoon: '🦝',
  kangaroo: '🦘',
}

const aminaIntros = [
  'Omg, check out this amazing',
  "*bounces excitedly* Here's a super cool fact about",
  "You won't BELIEVE what I found out about",
  '*gasps dramatically* Did you know this about',
  'Time for some mind-blowing facts about',
  '*spinning with excitement* Let me tell you about',
]

const animals = [
  'cat',
  'dog',
  'panda',
  'fox',
  'red_panda',
  'koala',
  'bird',
  'raccoon',
  'kangaroo',
]
const BASE_URL = 'https://some-random-api.com/animal'

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'facts',
  description:
    "Want to discover some super amazing animal facts? I've got tons to share!",
  cooldown: 1,
  category: 'FUN',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'name',
        description: 'Pick your animal friend! (I love them all! 💖)',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: animals.map(animal => ({ name: animal, value: animal })),
      },
    ],
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString('name')
    const response = await getFact(interaction.user, choice)
    await interaction.followUp(response)
  },
}

async function getFact(user, choice) {
  const response = await getJson(`${BASE_URL}/${choice}`)
  if (!response.success) {
    return {
      content:
        "*droops sadly* Oh no! Something went wrong with my fact-finding mission! But don't worry, we can try again! 🎨✨",
    }
  }

  const fact = response.data?.fact
  const imageUrl = response.data?.image
  const randomIntro =
    aminaIntros[Math.floor(Math.random() * aminaIntros.length)]

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(
      `${animalEmojis[choice] || '✨'} ${choice.toUpperCase()} FACTS! ${animalEmojis[choice] || '✨'}`
    )
    .setImage(imageUrl)
    .setDescription(
      `${randomIntro} ${choice}s!\n\n${fact}\n\n*✨ Isn't nature just absolutely amazing? ✨*`
    )
    .setFooter({
      text: `Requested by ${user.tag}! Smarter every day with Amina!`,
    })

  return { embeds: [embed] }
}
