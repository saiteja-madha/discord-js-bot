const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { MESSAGES, EMBED_COLORS } = require('@src/config.js')
const { getJson } = require('@helpers/HttpUtils')
const axios = require('axios')
const BASE_URL = 'https://some-random-api.com/animal'

// Choices for each category
const ANIMAL_CHOICES = [
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

const ANIME_CHOICES = ['waifu', 'shinobu', 'megumin']

// Amina's excited responses for different image types
const AMINA_RESPONSES = {
  // Animal responses
  cat: [
    'OMG LOOK AT THIS ADORABLE KITTY! 🐱✨',
    'Nyaa~! Found you a super cute cat!',
    'GASP! This cat is just too precious!',
  ],
  dog: [
    "PUPPY ALERT! My heart can't handle this! 🐶",
    'Look at this good boy/girl! I just wanna squish!',
    "WHO'S A GOOD DOG? THIS DOG IS!",
  ],
  panda: [
    "A PANDA! They're like nature's comedians! 🐼",
    'Look at this chunky bundle of joy!',
    'Found you the most adorable panda ever!',
  ],
  bird: [
    'EVERYBODY KNOWS THAT THE BIRD IS THE WORD! 🐦✨',
    "B-b-b-bird bird bird, b-bird's the word! 🎵",
    'Look what flew in! AND YES, THE BIRD IS STILL THE WORD! 🐦',
  ],
  fox: [
    'FOXY FRIEND ALERT! 🦊✨',
    'What does the fox say? CUTENESS!',
    'Look at this fantastic fox!',
  ],
  red_panda: [
    'Red pandas are just living plushies, change my mind! 🐼❤️',
    'THE CUTEST RED FLOOF!',
    'Found you a red panda to brighten your day!',
  ],
  koala: [
    'EUCALYPTUS ENTHUSIAST SPOTTED! 🐨',
    'The sleepiest and cutest tree hugger!',
    'Look at this adorable koala!',
  ],
  raccoon: [
    'TRASH PANDA SUPREMACY! 🦝✨',
    'Found the cutest little bandit!',
    'Look at this adorable chaos machine!',
  ],
  kangaroo: [
    'HOP HOP HOORAY! 🦘',
    'Found you a bouncy friend!',
    'Look at this amazing jumpy boi!',
  ],

  // Anime responses
  waifu: [
    '✨ CHECK OUT THIS AMAZING WAIFU! ✨',
    "Isn't she just perfect? My artistic soul is singing!",
    'Found you some top-tier waifu material!',
  ],
  shinobu: [
    'SHINOBU TIME! Get ready for awesomeness!',
    "Look who I found! Isn't she amazing?",
    'Shinobu appreciation moment! 💜',
  ],
  megumin: [
    "EXPLOSION! 💥 Here's your Megumin!",
    "The crimson demon herself! Isn't she awesome?",
    'Found the best explosion wizard!',
  ],

  // Default responses
  default: [
    "LOOK WHAT I FOUND! Isn't it amazing? ✨",
    'OMG OMG OMG! This is too perfect!',
    'My creative senses are tingling! This is awesome!',
  ],
}

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'image',
  description: 'Let Amina find you amazing pictures! 🎨✨',
  cooldown: 1,
  category: 'FUN',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'animal',
        description: 'Get cute animal pictures! 🐾',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'type',
            description: 'Which animal would you like to see?',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: ANIMAL_CHOICES.map(animal => ({
              name: animal.replace('_', ' '),
              value: animal,
            })),
          },
        ],
      },
      {
        name: 'anime',
        description: 'Get awesome anime pictures! ✨',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'type',
            description: 'Which character type would you like to see?',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: ANIME_CHOICES.map(anime => ({
              name: anime,
              value: anime,
            })),
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const subcommand = interaction.options.getSubcommand()
    const type = interaction.options.getString('type')

    let response
    if (subcommand === 'animal') {
      response = await getAnimalImage(interaction.user, type)
    } else {
      response = await getAnimeImage(interaction.user, type)
    }

    const message = await interaction.followUp(response)

    // Add reactions for all images
    await message.react('❤️')
    await message.react('✨')
  },
}

async function getAnimalImage(user, choice) {
  const response = await getJson(`${BASE_URL}/${choice}`)
  if (!response.success) return MESSAGES.API_ERROR

  const imageUrl = response.data?.image
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(getRandomResponse(choice))
    .setImage(imageUrl)
    .setFooter({
      text: `Requested by ${user.tag} | Amina's happy to help! ✨`,
      iconURL: user.displayAvatarURL(),
    })

  return { embeds: [embed] }
}

async function getAnimeImage(user, type) {
  try {
    const response = await axios.get(`https://api.waifu.pics/sfw/${type}`)

    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle(getRandomResponse(type))
          .setImage(response.data.url)
          .setFooter({
            text: `Requested by ${user.tag} | Amina's creative pick! 🎨`,
            iconURL: user.displayAvatarURL(),
          }),
      ],
    }
  } catch (ex) {
    console.error('Error fetching image:', ex)
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(
            "Oh no! My creative energy must've been too strong! Let's try again! 🎨✨"
          )
          .setFooter({
            text: `Requested by ${user.tag} | Don't worry, we'll get it next time!`,
            iconURL: user.displayAvatarURL(),
          }),
      ],
    }
  }
}

function getRandomResponse(type) {
  const responses = AMINA_RESPONSES[type] || AMINA_RESPONSES.default
  return responses[Math.floor(Math.random() * responses.length)]
}
