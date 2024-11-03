const { CommandCategory, BotClient } = require('@src/structures')
const { EMBED_COLORS } = require('@src/config.js')
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  CommandInteraction,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require('discord.js')
const { getSlashUsage } = require('@handlers/command')

const CMDS_PER_PAGE = 5
const IDLE_TIMEOUT = 900 // 15 minutes

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'help',
  description: 'command help menu',
  category: 'UTILITY',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'command',
        description: 'name of the command',
        required: false,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  async interactionRun(interaction) {
    let cmdName = interaction.options.getString('command')

    // !help
    if (!cmdName) {
      const response = await getHelpMenu(interaction)
      const sentMsg = await interaction.followUp(response)
      return waiter(sentMsg, interaction.member)
    }

    // check if command help (!help cat)
    const cmd = interaction.client.slashCommands.get(cmdName)
    if (cmd) {
      const embed = getSlashUsage(cmd)
      return interaction.followUp({ embeds: [embed] })
    }

    // No matching command/category found
    await interaction.followUp('No matching command found')
  },
}

/**
 * @param {CommandInteraction} interaction
 */
async function getHelpMenu({ client, guild, member }) {
  // Menu Row
  const options = []
  for (const [k, v] of Object.entries(CommandCategory)) {
    if (v.enabled === false) continue
    if (
      (v.name.includes('Moderation') ||
        v.name.includes('Admin') ||
        v.name.includes('Automod') ||
        v.name.includes('Ticket') ||
        v.name.includes('Giveaway')) &&
      !member.permissions.has('ManageGuild')
    ) {
      continue
    }
    if (
      v.name === 'Developer' &&
      !process.env.DEV_ID.split(',').includes(member.user.id)
    )
      continue
    options.push({
      label: v.name,
      value: k,
      description: `View commands in ${v.name} category`,
      emoji: v.emoji,
    })
  }

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('help-menu')
      .setPlaceholder('Choose the command category')
      .addOptions(options)
  )

  // Buttons Row
  let components = []
  components.push(
    new ButtonBuilder()
      .setCustomId('previousBtn')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('nextBtn')
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  )

  let buttonsRow = new ActionRowBuilder().addComponents(components)

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(
      '**About Me:**\n' +
        `Hello I am ${guild.members.me.displayName}!\n` +
        'A cool multipurpose discord bot which can serve all your needs\n\n' +
        `**Invite Me:** [Here](${client.getInvite()})\n` +
        `**Support Server:** [Join](${process.env.SUPPORT_SERVER})`
    )

  return {
    embeds: [embed],
    components: [menuRow, buttonsRow],
  }
}

/**
 * @param {import('discord.js').Message} msg
 * @param {import('discord.js').GuildMember} member
 */
const waiter = (msg, member) => {
  const collector = msg.channel.createMessageComponentCollector({
    filter: reactor =>
      reactor.user.id === member.id && msg.id === reactor.message.id,
    idle: IDLE_TIMEOUT * 1000,
    dispose: true,
    time: 5 * 60 * 1000,
  })

  let arrEmbeds = []
  let currentPage = 0
  let menuRow = msg.components[0]
  let buttonsRow = msg.components[1]

  collector.on('collect', async response => {
    if (!['help-menu', 'previousBtn', 'nextBtn'].includes(response.customId))
      return
    await response.deferUpdate()

    switch (response.customId) {
      case 'help-menu': {
        const cat = response.values[0].toUpperCase()
        arrEmbeds = getSlashCategoryEmbeds(msg.client, cat, member)
        currentPage = 0

        // Buttons Row
        let components = []
        buttonsRow.components.forEach(button =>
          components.push(
            ButtonBuilder.from(button).setDisabled(
              arrEmbeds.length > 1 ? false : true
            )
          )
        )

        buttonsRow = new ActionRowBuilder().addComponents(components)
        msg.editable &&
          (await msg.edit({
            embeds: [arrEmbeds[currentPage]],
            components: [menuRow, buttonsRow],
          }))
        break
      }

      case 'previousBtn':
        if (currentPage !== 0) {
          --currentPage
          msg.editable &&
            (await msg.edit({
              embeds: [arrEmbeds[currentPage]],
              components: [menuRow, buttonsRow],
            }))
        }
        break

      case 'nextBtn':
        if (currentPage < arrEmbeds.length - 1) {
          currentPage++
          msg.editable &&
            (await msg.edit({
              embeds: [arrEmbeds[currentPage]],
              components: [menuRow, buttonsRow],
            }))
        }
        break
    }
  })

  collector.on('end', () => {
    if (!msg.guild || !msg.channel) return
    return msg.editable && msg.edit({ components: [] })
  })
}

/**
 * Returns an array of message embeds for a particular command category [SLASH COMMANDS]
 * @param {BotClient} client
 * @param {string} category
 * @param {import('discord.js').GuildMember} member
 */
function getSlashCategoryEmbeds(client, category, member) {
  let collector = ''

  // For IMAGE Category
  if (category === 'IMAGE') {
    client.slashCommands
      .filter(cmd => cmd.category === category)
      .forEach(
        cmd => (collector += `\`/${cmd.name}\`\n ❯ ${cmd.description}\n\n`)
      )

    const availableFilters = client.slashCommands
      .get('filter')
      .slashCommand.options[0].choices.map(ch => ch.name)
      .join(', ')

    const availableGens = client.slashCommands
      .get('generator')
      .slashCommand.options[0].choices.map(ch => ch.name)
      .join(', ')

    collector +=
      '**Available Filters:**\n' +
      `${availableFilters}` +
      `*\n\n**Available Generators**\n` +
      `${availableGens}`

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(collector)

    return [embed]
  }

  // For REMAINING Categories
  const commands = Array.from(
    client.slashCommands.filter(cmd => cmd.category === category).values()
  )

  if (commands.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription('No commands in this category')

    return [embed]
  }

  const arrSplitted = []
  const arrEmbeds = []

  while (commands.length) {
    let toAdd = commands.splice(
      0,
      commands.length > CMDS_PER_PAGE ? CMDS_PER_PAGE : commands.length
    )

    toAdd = toAdd
      .map(cmd => {
        // Check if the user has the required permissions for the command
        if (cmd.userPermissions?.some(perm => !member.permissions.has(perm))) {
          return null
        }

        return `\`/${cmd.name}\`\n ❯ **Description**: ${cmd.description}\n`
      })
      .filter(Boolean) // Filter out any null values (commands the user doesn't have perms for)

    arrSplitted.push(toAdd)
  }

  arrSplitted.forEach((item, index) => {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(CommandCategory[category]?.image)
      .setAuthor({ name: `${category} Commands` })
      .setDescription(item.join('\n'))
      .setFooter({ text: `page ${index + 1} of ${arrSplitted.length}` })
    arrEmbeds.push(embed)
  })

  return arrEmbeds
}
