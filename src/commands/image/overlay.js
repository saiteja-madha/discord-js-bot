const {
  EmbedBuilder,
  AttachmentBuilder,
  ApplicationCommandOptionType,
} = require('discord.js')
const { getBuffer } = require('@helpers/HttpUtils')
const { EMBED_COLORS, IMAGE } = require('@root/config.js')

const availableOverlays = [
  'approved',
  'brazzers',
  'gay',
  'halloween',
  'rejected',
  'thuglife',
  'to-be-continued',
  'wasted',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'overlay',
  description: 'add overlay over the provided image',
  category: 'IMAGE',
  botPermissions: ['EmbedLinks', 'AttachFiles'],
  cooldown: 1,
  slashCommand: {
    enabled: IMAGE.ENABLED,
    options: [
      {
        name: 'name',
        description: 'the type of overlay',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: availableOverlays.map(overlay => ({
          name: overlay,
          value: overlay,
        })),
      },
      {
        name: 'user',
        description: 'the user to whose avatar the overlay needs to be applied',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: 'link',
        description: 'the image link to which the overlay needs to be applied',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const author = interaction.user
    const user = interaction.options.getUser('user')
    const imageLink = interaction.options.getString('link')
    const filter = interaction.options.getString('name')

    let image
    if (user) image = user.displayAvatarURL({ size: 256, extension: 'png' })
    if (!image && imageLink) image = imageLink
    if (!image) image = author.displayAvatarURL({ size: 256, extension: 'png' })

    const url = getOverlay(filter, image)
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    })

    if (!response.success)
      return interaction.followUp('Failed to generate image overlay')

    const attachment = new AttachmentBuilder(response.buffer, {
      name: 'attachment.png',
    })
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage('attachment://attachment.png')
      .setFooter({ text: `Requested by: ${author.username}` })

    await interaction.followUp({ embeds: [embed], files: [attachment] })
  },
}

function getOverlay(filter, image) {
  const endpoint = new URL(`${IMAGE.BASE_API}/overlays/${filter}`)
  endpoint.searchParams.append('image', image)
  return endpoint.href
}
