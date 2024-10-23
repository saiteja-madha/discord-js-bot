const {
  EmbedBuilder,
  AttachmentBuilder,
  ApplicationCommandOptionType,
} = require('discord.js')
const { getBuffer } = require('@helpers/HttpUtils')
const { EMBED_COLORS, IMAGE } = require('@root/config.js')

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
  description: 'generates a meme for the provided image',
  cooldown: 1,
  category: 'IMAGE',
  botPermissions: ['EmbedLinks', 'AttachFiles'],
  global: true,
  slashCommand: {
    enabled: IMAGE.ENABLED,
    options: [
      {
        name: 'name',
        description: 'the type of generator',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableGenerators.map(gen => ({ name: gen, value: gen })),
      },
      {
        name: 'user',
        description:
          'the user to whose avatar the generator needs to be applied',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: 'link',
        description:
          'the image link to which the generator needs to be applied',
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

    if (!response.success)
      return interaction.followUp('Failed to generate image')

    const attachment = new AttachmentBuilder(response.buffer, {
      name: 'attachment.png',
    })
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setImage('attachment://attachment.png')
      .setFooter({ text: `Requested by: ${author.username}` })

    await interaction.followUp({ embeds: [embed], files: [attachment] })
  },
}

function getGenerator(genName, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/generators/${genName}`)
  endpoint.searchParams.append('image', image)
  return endpoint.href
}
