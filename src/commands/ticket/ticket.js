const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const {
  isTicketChannel,
  closeTicket,
  closeAllTickets,
} = require('@handlers/ticket')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'ticket',
  description: 'various ticketing commands',
  category: 'TICKET',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'setup',
        description: 'setup a new ticket message',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description:
              'the channel where ticket creation message must be sent',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: 'log',
        description: 'setup log channel for tickets',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'channel where ticket logs must be sent',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: 'limit',
        description: 'set maximum number of concurrent open tickets',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'amount',
            description: 'max number of tickets',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: 'close',
        description: 'closes the ticket [used in ticket channel only]',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'closeall',
        description: 'closes all open tickets',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'add',
        description:
          'add user to the current ticket channel [used in ticket channel only]',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user_id',
            description: 'the id of the user to add',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        description:
          'remove user from the ticket channel [used in ticket channel only]',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'the user to remove',
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    let response

    // setup
    if (sub === 'setup') {
      const channel = interaction.options.getChannel('channel')

      if (!interaction.guild.members.me.permissions.has('ManageChannels')) {
        return interaction.followUp(
          'I am missing `Manage Channels` to create ticket channels'
        )
      }

      await interaction.deleteReply()
      return ticketModalSetup(interaction, channel, data.settings)
    }

    // Log channel
    else if (sub === 'log') {
      const channel = interaction.options.getChannel('channel')
      response = await setupLogChannel(channel, data.settings)
    }

    // Limit
    else if (sub === 'limit') {
      const limit = interaction.options.getInteger('amount')
      response = await setupLimit(limit, data.settings)
    }

    // Close
    else if (sub === 'close') {
      response = await close(interaction, interaction.user)
    }

    // Close all
    else if (sub === 'closeall') {
      response = await closeAll(interaction, interaction.user)
    }

    // Add to ticket
    else if (sub === 'add') {
      const inputId = interaction.options.getString('user_id')
      response = await addToTicket(interaction, inputId)
    }

    // Remove from ticket
    else if (sub === 'remove') {
      const user = interaction.options.getUser('user')
      response = await removeFromTicket(interaction, user.id)
    }

    if (response) await interaction.followUp(response)
  },
}

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup(
  { guild, channel, member },
  targetChannel,
  settings
) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_btnSetup')
      .setLabel('Setup Message')
      .setStyle(ButtonStyle.Primary)
  )

  const sentMsg = await channel.safeSend({
    content: 'Please click the button below to setup ticket message',
    components: [buttonRow],
  })

  if (!sentMsg) return

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: i =>
        i.customId === 'ticket_btnSetup' &&
        i.member.id === member.id &&
        i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch(ex => {})

  if (!btnInteraction)
    return sentMsg.edit({
      content: 'No response received, cancelling setup',
      components: [],
    })

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: 'ticket-modalSetup',
      title: 'Ticket Setup',
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('title')
            .setLabel('Embed Title')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Embed Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('footer')
            .setLabel('Embed Footer')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  )

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: m =>
        m.customId === 'ticket-modalSetup' &&
        m.member.id === member.id &&
        m.message.id === sentMsg.id,
    })
    .catch(ex => {})

  if (!modal)
    return sentMsg.edit({
      content: 'No response received, cancelling setup',
      components: [],
    })

  await modal.reply('Setting up ticket message ...')
  const title = modal.fields.getTextInputValue('title')
  const description = modal.fields.getTextInputValue('description')
  const footer = modal.fields.getTextInputValue('footer')

  // create ticket channel category
  if (
    !guild.channels.cache.find(
      ch => ch.name === 'Tickets' && ch.type === ChannelType.GuildCategory
    )
  ) {
    guild.channels.create({
      name: 'Tickets',
      type: ChannelType.GuildCategory,
      permissionsOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    })
  }

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || 'Support Ticket' })
    .setDescription(
      description || 'Please use the button below to create a ticket'
    )
    .setFooter({ text: footer || 'You can only have 1 open ticket at a time!' })

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Open a ticket')
      .setCustomId('TICKET_CREATE')
      .setStyle(ButtonStyle.Success)
  )

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] })
  await modal.deleteReply()
  await sentMsg.edit({
    content: 'Done! Ticket Message Created',
    components: [],
  })
}

async function setupLogChannel(target, settings) {
  if (!target.canSendEmbeds())
    return `Oops! I do have have permission to send embed to ${target}`

  settings.ticket.log_channel = target.id
  await settings.save()

  return `Configuration saved! Ticket logs will be sent to ${target.toString()}`
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 5)
    return 'Ticket limit cannot be less than 5'

  settings.ticket.limit = limit
  await settings.save()

  return `Configuration saved. You can now have a maximum of \`${limit}\` open tickets`
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel))
    return 'This command can only be used in ticket channels'
  const status = await closeTicket(channel, author, 'Closed by a moderator')
  if (status === 'MISSING_PERMISSIONS')
    return 'I do not have permission to close tickets'
  if (status === 'ERROR') return 'An error occurred while closing the ticket'
  return null
}

async function closeAll({ guild }, user) {
  const stats = await closeAllTickets(guild, user)
  return `Completed! Success: \`${stats[0]}\` Failed: \`${stats[1]}\``
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel))
    return 'This command can only be used in ticket channel'
  if (!inputId || isNaN(inputId))
    return 'Oops! You need to input a valid userId/roleId'

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    })

    return 'Done'
  } catch (ex) {
    return 'Failed to add user/role. Did you provide a valid ID?'
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel))
    return 'This command can only be used in ticket channel'
  if (!inputId || isNaN(inputId))
    return 'Oops! You need to input a valid userId/roleId'

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    })
    return 'Done'
  } catch (ex) {
    return 'Failed to remove user/role. Did you provide a valid ID?'
  }
}
