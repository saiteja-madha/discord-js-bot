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
const { showUpdateModal, handleUpdateModal } = require('@handlers/updates')
const { addQuestion, deleteQuestion } = require('@schemas/TruthOrDare') // Import from mtod.js
require('dotenv').config()

const DEV_ID = process.env.DEV_ID
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
        name: 'listservers',
        description: 'Get a list of servers the bot is in',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'leaveserver',
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
      // mtod.js: Add question subcommand
      {
        name: 'add-tod',
        description: 'Add a Truth or Dare question',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'category',
            description: 'Category of the question',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              { name: 'Truth', value: 'truth' },
              { name: 'Dare', value: 'dare' },
              { name: 'Paranoia', value: 'paranoia' },
              { name: 'Never Have I Ever', value: 'nhie' },
              { name: 'Would You Rather', value: 'wyr' },
              { name: 'Have You Ever', value: 'hye' },
              { name: 'What Would You Do', value: 'wwyd' },
            ],
          },
          {
            name: 'question',
            description: 'The question to add',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },

      // mtod.js: Delete question subcommand
      {
        name: 'del-tod',
        description: 'Delete a Truth or Dare question',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'category',
            description: 'Category of the question',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              { name: 'Truth', value: 'truth' },
              { name: 'Dare', value: 'dare' },
              { name: 'Paranoia', value: 'paranoia' },
              { name: 'Never Have I Ever', value: 'nhie' },
              { name: 'Would You Rather', value: 'wyr' },
              { name: 'Have You Ever', value: 'hye' },
              { name: 'What Would You Do', value: 'wwyd' },
            ],
          },
          {
            name: 'q_id',
            description: 'ID of the question to delete',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'update',
        description: 'Send an update to all servers',
        type: ApplicationCommandOptionType.Subcommand,
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
        name: 'settings',
        description: 'Trigger settings for servers',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'serverid',
            description: 'ID of the server to trigger settings (optional)',
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
        "Aww, sorry cutie! You're not authorized to use this command! 💖"
      )
    }

    const sub = interaction.options.getSubcommand()

    // Subcommand: list
    if (sub === 'listservers') {
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
    if (sub === 'leaveserver') {
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

    // Subcommand: update
    if (sub === 'update') {
      await interaction.deferReply({ ephemeral: true })
      try {
        await showUpdateModal(interaction)
      } catch (error) {
        console.error('Error showing update modal:', error)
        await interaction.editReply(
          'There was an error showing the update modal. Please try again.'
        )
      }
      return
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

    // Subcommand: add-tod
    if (sub === 'add-tod') {
      const category = interaction.options.getString('category')
      const question = interaction.options.getString('question')
      const response = await addQuestion(category, question)
      await interaction.followUp({
        content: `Yay! 🎉 Your new *${category}* question has been added: "${question}"! So fun, right? 😄`,
        embeds: [response],
      })
    }

    // Subcommand: del-tod
    if (sub === 'del-tod') {
      const category = interaction.options.getString('category')
      const questionId = interaction.options.getString('q_id')
      const response = await deleteQuestion(category, questionId)
      await interaction.followUp({
        content: `Oh nooo~ 😢 Question from *${category}* has been deleted... But it's okay, we'll add more fun ones soon! ✨`,
        embeds: [response],
      })
    }

    // New subcommand: triggersettings
    if (sub === 'settings') {
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

  async modalRun(interaction) {
    if (interaction.customId === 'MOCHI_UPDATE_MODAL') {
      await handleUpdateModal(interaction, interaction.client)
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
    if (settings.server.setup_completed) return '❌ Guild already set up'
    guildCreateEvent(guild)
    return `✅ Triggered settings for ${guild.name}`
  }

  let count = 0
  for (const [id, guild] of client.guilds.cache) {
    const settings = await getSettings(guild)
    if (!settings.server.setup_completed) {
      guildCreateEvent(guild)
      count++
    }
  }

  return `✅ Triggered settings for ${count} guilds`
}
