const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
  ApplicationCommandOptionType,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config')
const { BotClient } = require('@src/structures')
const { getSettings } = require('@schemas/Guild')
require('dotenv').config()

const DEV_ID = process.env.DEV_ID

// This dummy token will be replaced by the actual token
const DUMMY_TOKEN = 'MY_TOKEN_IS_SECRET'

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'dev',
  description: 'Developer-only commands',
  category: 'DEV',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'list',
        description: 'Get a list of servers the bot is in',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'leave',
        description: 'Leave a server',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'serverid',
            description: 'ID of the server to leave',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'exec',
        description: 'Execute something on terminal',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'script',
            description: 'Script to execute',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'setprefix',
        description: 'Sets a new prefix for this server',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'newprefix',
            description: 'The new prefix to set',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'eval',
        description: 'Evaluates something',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'expression',
            description: 'Content to evaluate',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      {
        name: 'triggeronboarding',
        description: 'Trigger onboarding for servers',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'serverid',
            description: 'ID of the server to trigger onboarding (optional)',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },

      {
        name: 'reload',
        description: "Reloads a command that's been modified",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'type',
            description: 'Type of command to reload',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              { name: 'Commands', value: 'commands' },
              { name: 'Events', value: 'events' },
              { name: 'Contexts', value: 'contexts' },
              { name: 'All', value: 'all' },
            ],
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    if (interaction.user.id !== DEV_ID) {
      return interaction.followUp(
        "You don't have permission to use this command."
      )
    }
    const sub = interaction.options.getSubcommand()

    // Subcommand: list
    if (sub === 'list') {
      const { client, channel, member } = interaction
      const matched = []
      const match = interaction.options.getString('match') || null

      // Match by ID or name
      if (match) {
        if (client.guilds.cache.has(match)) {
          matched.push(client.guilds.cache.get(match))
        }
        client.guilds.cache
          .filter(g => g.name.toLowerCase().includes(match.toLowerCase()))
          .forEach(g => matched.push(g))
      }

      const servers = match ? matched : Array.from(client.guilds.cache.values())
      const total = servers.length
      const maxPerPage = 10
      const totalPages = Math.ceil(total / maxPerPage)

      if (totalPages === 0) return interaction.followUp('No servers found')
      let currentPage = 1

      // Embed Builder
      const buildEmbed = () => {
        const start = (currentPage - 1) * maxPerPage
        const end = start + maxPerPage < total ? start + maxPerPage : total

        const embed = new EmbedBuilder()
          .setColor(client.config.EMBED_COLORS.BOT_EMBED)
          .setAuthor({ name: 'List of servers' })
          .setFooter({
            text: `${match ? 'Matched' : 'Total'} Servers: ${total} • Page ${currentPage} of ${totalPages}`,
          })

        const fields = []
        for (let i = start; i < end; i++) {
          const server = servers[i]
          fields.push({
            name: server.name,
            value: server.id,
            inline: true,
          })
        }
        embed.addFields(fields)

        return embed
      }

      const embed = buildEmbed()
      const sentMsg = await interaction.followUp({
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prevBtn')
              .setEmoji('⬅️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('nxtBtn')
              .setEmoji('➡️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(totalPages === 1)
          ),
        ],
      })

      // Listeners for pagination
      const collector = interaction.channel.createMessageComponentCollector({
        filter: response =>
          response.user.id === member.id && response.message.id === sentMsg.id,
        componentType: ComponentType.Button,
      })

      collector.on('collect', async response => {
        await response.deferUpdate()

        if (response.customId === 'prevBtn' && currentPage > 1) {
          currentPage--
          const embed = buildEmbed()
          await sentMsg.edit({ embeds: [embed] })
        }
        if (response.customId === 'nxtBtn' && currentPage < totalPages) {
          currentPage++
          const embed = buildEmbed()
          await sentMsg.edit({ embeds: [embed] })
        }
      })

      collector.on('end', async () => {
        await sentMsg.edit({ components: [] })
      })
    }

    // Subcommand: leave
    if (sub === 'leave') {
      const input = interaction.options.getString('serverid')
      const guild = interaction.client.guilds.cache.get(input)
      if (!guild) {
        return interaction.followUp(
          `No server found. Please provide a valid server ID.`
        )
      }

      const name = guild.name
      try {
        await guild.leave()
        return interaction.followUp(`Successfully left \`${name}\``)
      } catch (err) {
        interaction.client.logger.error('GuildLeave', err)
        return interaction.followUp(`Failed to leave \`${name}\``)
      }
    }

    // Subcommand: exec
    if (sub === 'exec') {
      const script = interaction.options.getString('script')
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('Spawning Shell...')
            .setDescription(`Executing command...`)
            .setAuthor({
              name: interaction.client.user.displayName,
              iconURL: interaction.client.user.displayAvatarURL(),
            }),
        ],
      })

      const result = await execute(script)
      interaction.followUp({ embeds: result })
    }

    // Subcommand: setprefix
    if (sub === 'setprefix') {
      const newPrefix = interaction.options.getString('newprefix')
      const response = await setNewPrefix(newPrefix, interaction.data.settings)
      await interaction.followUp(response)
    }

    // Subcommand: eval
    if (sub === 'eval') {
      const input = interaction.options.getString('expression')
      let response
      try {
        const output = eval(input)
        response = buildSuccessResponse(output, interaction.client)
      } catch (ex) {
        response = buildErrorResponse(ex)
      }
      await interaction.followUp(response)
    }
    // New subcommand: triggeronboarding
    if (sub === 'triggeronboarding') {
      const serverId = interaction.options.getString('serverid')
      const response = await triggerOnboarding(interaction.client, serverId)
      await interaction.followUp(response)
    }
    // Subcommand: reload
    if (sub === 'reload') {
      const client = new BotClient()
      const type = interaction.options.getString('type')

      try {
        switch (type.toLowerCase()) {
          case 'commands':
            client.loadCommands('src/commands')
            break
          case 'events':
            client.loadEvents('src/events')
            break
          case 'contexts':
            client.loadContexts('src/contexts')
            break
          case 'all':
            client.loadCommands('src/commands')
            client.loadContexts('src/contexts')
            client.loadEvents('src/events')
            break
          default:
            return interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setTitle('Error')
                  .setDescription('Command type not selected')
                  .setColor('Red'),
              ],
            })
        }
      } catch (e) {
        console.error(e)
      }
      return interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('Reloaded')
            .setDescription(`Reloaded ${type}`)
            .setColor('Green'),
        ],
      })
    }
  },
}

// Functions: execute, setNewPrefix, buildSuccessResponse, buildErrorResponse
async function execute(script) {
  try {
    const { stdout } = await util.promisify(exec)(script)
    const outputEmbed = new EmbedBuilder()
      .setTitle('📥 Output')
      .setDescription(
        `\`\`\`bash\n${stdout.length > 4096 ? `${stdout.substr(0, 4000)}...` : stdout}\n\`\`\``
      )
      .setColor(EMBED_COLORS.DEFAULT)
    return outputEmbed
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setTitle('📤 Error')
      .setDescription(
        `\`\`\`bash\n${error.message.length > 4096 ? `${error.message.substr(0, 4000)}...` : error.message}\n\`\`\``
      )
      .setColor(EMBED_COLORS.ERROR)
    return errorEmbed
  }
}

async function setNewPrefix(newPrefix, settings) {
  if (newPrefix.length > 2) return 'Prefix length cannot exceed `2` characters'
  settings.prefix = newPrefix
  await settings.save()
  return `New prefix is set to \`${newPrefix}\``
}

const buildSuccessResponse = (output, client) => {
  output = require('util')
    .inspect(output, { depth: 0 })
    .replaceAll(client.token, DUMMY_TOKEN)

  const embed = new EmbedBuilder()
    .setAuthor({ name: '📤 Output' })
    .setDescription(
      '```js\n' +
        (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) +
        '\n```'
    )
    .setColor('Random')
    .setTimestamp(Date.now())

  return { embeds: [embed] }
}

const buildErrorResponse = err => {
  const embed = new EmbedBuilder()
    .setAuthor({ name: '📤 Error' })
    .setDescription(
      '```js\n' +
        (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) +
        '\n```'
    )
    .setColor(EMBED_COLORS.ERROR)
    .setTimestamp(Date.now())

  return { embeds: [embed] }
}

// New function: triggerOnboarding
async function triggerOnboarding(client, serverId = null) {
  const guildCreateEvent = client.emit.bind(client, 'guildCreate')

  if (serverId) {
    const guild = client.guilds.cache.get(serverId)
    if (!guild) return '❌ Guild not found'
    const settings = await getSettings(guild)
    if (settings.setup_completed) return '❌ Guild already set up'
    guildCreateEvent(guild)
    return `✅ Triggered onboarding for ${guild.name}`
  }

  let count = 0
  for (const [id, guild] of client.guilds.cache) {
    const settings = await getSettings(guild)
    if (!settings.setup_completed) {
      guildCreateEvent(guild)
      count++
    }
  }

  return `✅ Triggered onboarding for ${count} guilds`
}
