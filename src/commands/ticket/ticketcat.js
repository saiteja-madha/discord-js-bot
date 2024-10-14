const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ChannelType,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'ticket-category',
  description: 'manage ticket categories',
  category: 'TICKET',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'list',
        description: 'list all ticket categories',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'add',
        description: 'add a ticket category',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'category',
            description: 'the category name',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildCategory],
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        description: 'remove a ticket category',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'category',
            description: 'the category name',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    let response

    // list
    if (sub === 'list') {
      response = listCategories(data)
    }

    // add
    else if (sub === 'add') {
      const category = interaction.options.getString('category')
      response = await addCategory(interaction.guild, data, category)
    }

    // remove
    else if (sub === 'remove') {
      const category = interaction.options.getString('category')
      response = await removeCategory(data, category)
    } else response = 'Invalid subcommand'
    await interaction.followUp(response)
  },
}

async function addCategory(guild, data, category) {
  if (!category) return 'Invalid usage! Missing category name.'

  // check if category already exists
  if (data.settings.ticket.categories.find(c => c.name === category)) {
    return `Category \`${category}\` already exists.`
  }

  data.settings.ticket.categories.push({
    name: category,
  })
  await data.settings.save()

  return `Category \`${category}\` added.`
}

async function removeCategory(data, category) {
  const categories = data.settings.ticket.categories
  // check if category exists
  if (!categories.find(c => c.name === category)) {
    return `Category \`${category}\` does not exist.`
  }

  data.settings.ticket.categories = categories.filter(c => c.name !== category)
  await data.settings.save()

  return `Category \`${category}\` removed.`
}

function listCategories(data) {
  const categories = data.settings.ticket.categories
  if (categories?.length === 0) return 'No ticket categories found.'

  const fields = []
  const serverStaffRoles = data.settings.server.staff_roles

  for (const category of categories) {
    const roleNames =
      serverStaffRoles.length > 0
        ? serverStaffRoles
            .map((r, index) => `${index + 1}. <@&${r}>`)
            .join('\n')
        : 'None'

    fields.push({
      name: `📂 **Category:**`,
      value: `${category.name}`,
    })
    fields.push({ name: '**Staff Roles:**', value: `${roleNames}` })
    fields.push({
      name: '\u200B', // This is a zero-width space to create an empty field
      value:
        'Want to edit staff roles? Use the `/settings staffadd/staffremove` command!',
    })
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: '🌟 Ticket Categories' })
    .setColor(EMBED_COLORS.BOT_EMBED) // Use Mochi's bot embed color
    .addFields(fields)
  return { embeds: [embed] }
}
