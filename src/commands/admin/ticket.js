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
  getTicketChannels,
} = require('@handlers/ticket')
const { getSettings, updateSettings } = require('@schemas/Guild')

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
      {
        name: 'topic',
        description: 'manage ticket topics',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: 'list',
            description: 'list all ticket topics',
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            name: 'add',
            description: 'add a ticket topic',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'topic',
                description: 'the topic name',
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
          {
            name: 'remove',
            description: 'remove a ticket topic',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'topic',
                description: 'the topic to remove',
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
        ],
      },
      {
        name: 'category',
        description: 'manage the category for ticket channels',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: 'add',
            description: 'set the category for ticket channels',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'category',
                description: 'the category to use for ticket channels',
                type: ApplicationCommandOptionType.Channel,
                channelTypes: [ChannelType.GuildCategory],
                required: true,
              },
            ],
          },
          {
            name: 'remove',
            description: 'remove the current ticket category',
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    const group = interaction.options.getSubcommandGroup(false)
    let response
    // Handle ticket category commands
    if (group === 'category') {
      if (sub === 'add') {
        const category = interaction.options.getChannel('category')
        response = await setupTicketCategory(interaction.guild, category)
      } else if (sub === 'remove') {
        response = await removeTicketCategory(interaction.guild)
      }
    }

    // Handle ticket commands
    else if (!group) {
      if (sub === 'setup') {
        const channel = interaction.options.getChannel('channel')

        if (!interaction.guild.members.me.permissions.has('ManageChannels')) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setDescription(
                  "Oops! I'm missing the `Manage Channels` permission to create ticket channels. Could you please give me that permission? Pretty please? 🙏"
                ),
            ],
          })
        }
        await interaction.deleteReply()
        return ticketModalSetup(interaction, channel)
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
    }

    // Handle ticket topics commands
    else if (group === 'topic') {
      if (sub === 'list') {
        response = listTopics(data)
      } else if (sub === 'add') {
        const topic = interaction.options.getString('topic')
        response = await addTopic(data, topic)
      } else if (sub === 'remove') {
        const topic = interaction.options.getString('topic')
        response = await removeTopic(data, topic)
      }
    }

    if (response) {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.SUCCESS)
            .setDescription(response),
        ],
      })
    }
  },
}

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */

async function setupTicketCategory(guild, category) {
  if (category.type !== ChannelType.GuildCategory) {
    return "Oopsie! 😅 That's not a category channel. Can you try again with a proper category? Pretty please? 💖"
  }

  const settings = await getSettings(guild)
  settings.ticket.category = category.id
  settings.ticket.enabled = true
  await updateSettings(guild.id, settings)

  return `Yay! 🎉 I've set the ticket category to ${category.name}. All new tickets will appear there now!`
}

async function removeTicketCategory(guild) {
  const settings = await getSettings(guild)
  if (!settings.ticket.category) {
    return "Oh no! 😮 There's no ticket category set right now. Nothing to remove!"
  }

  settings.ticket.category = null
  settings.ticket.enabled = false
  await updateSettings(guild.id, settings)

  let response =
    "I've removed the ticket category and disabled the ticket system. 🎈\n\n"
  response += 'To set up a new category, please use `/ticket category add`.\n'
  response +=
    "If you don't, I'll create a new 'Tickets' category when someone opens a ticket. 📁"

  return response
}

async function ticketModalSetup({ guild, channel, member }, targetChannel) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_btnSetup')
      .setLabel('Setup Message')
      .setStyle(ButtonStyle.Primary)
  )

  const sentMsg = await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(
          'Please click the button below to setup the ticket message 🎫'
        ),
    ],
    components: [buttonRow],
  })

  if (!sentMsg) {
    return interaction.reply({
      content:
        "I couldn't send the setup message. Please check my permissions and try again.",
      ephemeral: true,
    })
  }

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: i =>
        i.customId === 'ticket_btnSetup' &&
        i.member.id === member.id &&
        i.message.id === sentMsg.id,
      time: 100000,
    })
    .catch(ex => {})

  if (!btnInteraction) {
    return sentMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription('No response received, cancelling setup 😔'),
      ],
      components: [],
    })
  }

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
      time: 1 * 60 * 10000,
      filter: m =>
        m.customId === 'ticket-modalSetup' &&
        m.member.id === member.id &&
        m.message.id === sentMsg.id,
    })
    .catch(ex => {})

  if (!modal) {
    return sentMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription('No response received, cancelling setup 😔'),
      ],
      components: [],
    })
  }

  await modal.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription('Setting up ticket message... 🎫'),
    ],
  })

  const title = modal.fields.getTextInputValue('title')
  const description = modal.fields.getTextInputValue('description')
  const footer = modal.fields.getTextInputValue('footer')

  // Check if a custom category is set, otherwise create 'Tickets' category
  const settings = await getSettings(guild)
  let ticketCategory = guild.channels.cache.get(settings.ticket.category)
  if (!ticketCategory) {
    ticketCategory = await guild.channels.create({
      name: 'Tickets',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    })
    settings.ticket.category = ticketCategory.id
    settings.ticket.enabled = true
    await updateSettings(guild.id, settings)
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

  const ticketMessage = await targetChannel.send({
    embeds: [embed],
    components: [tktBtnRow],
  })

  // Update settings with the new message ID
  settings.ticket.setup_message_id = ticketMessage.id
  await updateSettings(guild.id, settings)

  await modal.deleteReply()
  await sentMsg.edit({
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setDescription('Yay! Ticket Message Created Successfully! 🎉'),
    ],
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

// topic management
async function addTopic(data, topic) {
  if (!topic)
    return 'Oopsie! 🙈 You forgot to tell me which topic to add. Try again, pretty please?'

  const lowercaseTopic = topic.toLowerCase()

  // check if topic already exists
  if (
    data.settings.ticket.topics.find(
      t => t.name.toLowerCase() === lowercaseTopic
    )
  ) {
    return `Uh-oh! 😅 The topic \`${topic}\` is already on our list. No need to add it again, silly!`
  }

  data.settings.ticket.topics.push({
    name: topic,
  })
  await data.settings.save()

  return `Yay! 🎉 I've added the topic \`${topic}\` to our awesome list!`
}

async function removeTopic(data, topic) {
  if (!topic)
    return 'Oopsie! 🙈 You forgot to tell me which topic to remove. Try again, pretty please?'

  const lowercaseTopic = topic.toLowerCase()

  const topics = data.settings.ticket.topics
  // check if topic exists
  if (!topics.find(t => t.name.toLowerCase() === lowercaseTopic)) {
    return `Hmm... 🤔 I couldn't find the topic \`${topic}\`. Are you sure it's on our list?`
  }

  data.settings.ticket.topics = topics.filter(
    t => t.name.toLowerCase() !== lowercaseTopic
  )
  await data.settings.save()

  return `All done! 👋 I've removed the topic \`${topic}\` from our list.`
}

function listTopics(data) {
  const topics = data.settings.ticket.topics

  const embed = new EmbedBuilder()
    .setAuthor({ name: '🌟 Ticket Topics' })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter({
      text: 'Thank you for having me! 💕',
    })

  if (topics.length === 0) {
    embed.setDescription(
      "Oh no! 😮 We don't have any ticket topics yet. " +
        "Let's add some to make our ticketing system super awesome! 💖\n\n" +
        'Use `/ticket topic add` to add new topics.'
    )
    return { embeds: [embed] }
  }

  const topicNames = topics.map(t => t.name).join(', ')
  embed.addFields({
    name: `📂 **Topics:**`,
    value: topicNames,
  })

  embed.setDescription(
    'Here are all our current ticket topics! 🎉\n' +
      'Remember, you can always add more or remove them as needed.\n\n' +
      'To add a new topic, use `/ticket topic add`.\n' +
      'To remove a topic, use `/ticket topic remove`.'
  )

  return { embeds: [embed] }
}
