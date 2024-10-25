const {
  EmbedBuilder,
  AttachmentBuilder,
  ApplicationCommandOptionType,
} = require('discord.js')
const { getBuffer } = require('@helpers/HttpUtils')
const { EMBED_COLORS, IMAGE } = require('@src/config.js')

// Amina's favorite meme reactions
const memeReactions = {
  ad: '✨ Making you famous! ',
  affect: 'Oops, what happened here? 😅',
  beautiful: "Now that's art! 🎨",
  bobross: 'Happy little accidents~ 🎨',
  challenger: 'Game on! 🎮',
  confusedstonk: 'Wait, what? 📈',
  delete: 'Poof! 🗑️',
  dexter: 'Time for science! 🧪',
  facepalm: '*giggles* Oh no... 🤦',
  jail: 'Busted! 🚔',
  jokeoverhead: 'Whoosh~ ✨',
  karaba: 'Magic time! ✨',
  'kyon-gun': 'Pew pew! 🔫',
  mms: 'Sweet! 🍫',
  notstonk: 'Oof, down we go! 📉',
  poutine: 'Yummy! 🍜',
  rip: 'Press F to pay respects 💐',
  shit: 'Yikes! 💩',
  stonk: 'To the moon! 📈',
  tattoo: 'Forever art! 🎨',
  thomas: 'Choo choo! 🚂',
  trash: "One person's trash... 🗑️",
  wanted: 'Catch them! 🏃‍♂️',
  worthless: '*gasp* No way! ✨',
}

const availableGenerators = [
  'ad',
  'affect',
  'beautiful',
  'bobross',
  'challenger',
  'confusedstonk',
  'delete',
  'dexter',
  'facepalm',
  'hitler',
  'jail',
  'jokeoverhead',
  'karaba',
  'kyon-gun',
  'mms',
  'notstonk',
  'poutine',
  'rip',
  'shit',
  'stonk',
  'tattoo',
  'thomas',
  'trash',
  'wanted',
  'worthless',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'generator',
  description: 'Transform images into memes! ✨',
  cooldown: 1,
  category: 'IMAGE',
  botPermissions: ['EmbedLinks', 'AttachFiles'],
  slashCommand: {
    enabled: IMAGE.ENABLED,
    options: [
      {
        name: 'name',
        description: 'Pick your meme style!',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableGenerators.map(gen => ({ name: gen, value: gen })),
      },
      {
        name: 'user',
        description: 'Whose picture should we transform?',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: 'link',
        description: 'Or use an image link!',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const author = interaction.user
    const user = interaction.options.getUser('user')
    const imageLink = interaction.options.getString('link')
    const generator = interaction.options.getString('name')

    let image
    if (user) image = user.displayAvatarURL({ size: 256, extension: 'png' })
    if (!image && imageLink) image = imageLink
    if (!image) image = author.displayAvatarURL({ size: 256, extension: 'png' })

    const url = getGenerator(generator, image)
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    })

    if (!response.success) {
      return interaction.followUp(
        '*drops art supplies* Oops! Something went wrong with the meme magic! 🎨💔'
      )
    }

    const attachment = new AttachmentBuilder(response.buffer, {
      name: 'attachment.png',
    })
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle(memeReactions[generator] || 'Meme magic incoming! ✨')
      .setImage('attachment://attachment.png')
      .setFooter({ text: `${author.username}'s meme creation! 🎨` })

    await interaction.followUp({ embeds: [embed], files: [attachment] })
  },
}

function getGenerator(genName, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/generators/${genName}`)
  endpoint.searchParams.append('image', image)
  return endpoint.href
}
