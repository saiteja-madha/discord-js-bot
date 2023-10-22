const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: 'qrcode',
  description: 'Generate a QR code with the url that is provided',
  category: 'ADMIN',
  botPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'url',
        description: 'URL to generate QR code for',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  async interactionRun(interaction) {
    const { user, guild } = interaction
    const text = interaction.options.getString('url')
    const baseURL = 'http://api.qrserver.com/v1'
    const regex =
      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

    if (!text.match(regex)) {
      const embed = new EmbedBuilder()
        .setColor('RED')
        .setTitle(`Invalid URL`)
        .setDescription(`Please provide a valid URL.`)
        .setFooter({ text: guild.name })
        .setTimestamp()

      return
    }

    const encodedURL =
      `${baseURL}/create-qr-code/?size=150x150&data=` + encodeURIComponent(text)

    const embedqr = new EmbedBuilder()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setColor('Green')
      .setTitle(`QR Code`)
      .setDescription(
        `Here is your QR code for the URL:  [click here](${text})`
      )
      .setImage(encodedURL)
      .setThumbnail(
        'https://img.freepik.com/vector-premium/personaje-dibujos-animados-codigo-qr-buscando-lupa-diseno-lindo_152558-13614.jpg?w=826'
      )
      .setFooter({ text: guild.name })
      .setTimestamp()

    interaction.channel.send({ embeds: [embedqr] })
  },
}
