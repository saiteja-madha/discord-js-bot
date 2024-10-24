const { EmbedBuilder } = require('discord.js')
const axios = require('axios')
const { EMBED_COLORS } = require('@src/config')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'anime',
  description: 'Get a waifu, shinobu or megmin image',
  enabled: true,
  category: 'ANIME',
  cooldown: 1,

  slashCommand: {
    enabled: true,
    description: 'Get a random image!',
    options: [
      {
        name: 'image',
        description: 'Choose an image',
        type: 3, // String option
        required: true,
        choices: [
          { name: 'waifu', value: 'waifu' },
          { name: 'shinobu', value: 'shinobu' },
          { name: 'megumin', value: 'megumin' },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const image = interaction.options.getString('image')
    const embed = await genActionEmbed(image, interaction.user)

    // Send the embed and react to it
    const message = await interaction.followUp({ embeds: [embed] })
    await message.react('❤️') // Heart reaction
    await message.react('👎') // Disapproval reaction
  },
}

const genActionEmbed = async (image, user) => {
  try {
    // Send a request to the Waifu.pics API
    const response = await axios.get(`https://api.waifu.pics/sfw/${image}`)

    return new EmbedBuilder()
      .setTitle(`${capitalize(image)} image!`)
      .setImage(response.data.url)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setFooter({ text: `Requested by ${user.username}` })
  } catch (ex) {
    console.error('Error fetching image:', ex)
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription('Failed to fetch an image image. Try again!')
      .setFooter({ text: `Requested by ${user.username}` })
  }
}

// Helper function to capitalize the first letter of the image name
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
