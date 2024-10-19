const { getBuffer } = require('@helpers/HttpUtils')
const {
  AttachmentBuilder,
  ApplicationCommandOptionType,
} = require('discord.js')

const PROXY_TYPES = ['all', 'http', 'socks4', 'socks5']

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'proxies',
  description: 'fetch proxies. Available types: http, socks4, socks5',
  category: 'UTILITY',
  botPermissions: ['EmbedLinks', 'AttachFiles'],
  global: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'type',
        description: 'type of proxy',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: PROXY_TYPES.map(p => ({ name: p, value: p })),
      },
    ],
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString('type')
    await interaction.followUp('Fetching proxies... Please wait')
    const response = await getProxies(type)
    await interaction.editReply(response)
  },
}

async function getProxies(type) {
  const response = await getBuffer(
    `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
  )

  if (!response.success || !response.buffer) return 'Failed to fetch proxies'
  if (response.buffer.length === 0)
    return 'Could not fetch data. Try again later'

  const attachment = new AttachmentBuilder(response.buffer, {
    name: `${type.toLowerCase()}_proxies.txt`,
  })
  return {
    content: `${type.toUpperCase()} Proxies fetched`,
    files: [attachment],
  }
}
