const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { model: ReactionRoleModel } = require('@schemas/ReactionRoles')

module.exports = {
  name: 'settings',
  description: "Manage Mochi's settings for this server",
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  botPermissions: ['EmbedLinks'],

  slashCommand: {
    ephemeral: true,
    enabled: true,
    options: [
      {
        name: 'updateschannel',
        description: 'Set the updates channel for Mochi',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'Select a channel for updates',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            ],
            required: true,
          },
        ],
      },
      {
        name: 'staffadd',
        description: 'Add a staff role for Mochi',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'role',
            description: 'Select a role to add as staff',
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: 'staffremove',
        description: 'Remove a staff role from Mochi',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'role',
            description: 'Select a role to remove from staff',
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: 'status',
        description: 'List all current settings and their values',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()

    if (sub === 'updateschannel') {
      const channel = interaction.options.getChannel('channel')
      return await updateChannel(interaction, channel, data.settings)
    }

    if (sub === 'staffadd') {
      const role = interaction.options.getRole('role')
      return await addStaffRole(interaction, role, data.settings)
    }

    if (sub === 'staffremove') {
      const role = interaction.options.getRole('role')
      return await removeStaffRole(interaction, role, data.settings)
    }

    if (sub === 'status') {
      return await statusSettings(interaction, data.settings)
    }
  },
}

async function updateChannel(interaction, channel, settings) {
  if (
    !channel
      .permissionsFor(interaction.guild.members.me)
      .has(PermissionFlagsBits.SendMessages)
  ) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(
        "Oopsie! 😅 I don't have permission to send messages in that channel. Can you please give me the right permissions? Pretty please? 🙏"
      )
    return interaction.followUp({ embeds: [embed] })
  }

  settings.server.updates_channel = channel.id
  await updateSetupStatus(settings)
  await settings.save()

  const setupEmbed = createSetupEmbed(settings)
  await interaction.followUp({ embeds: [setupEmbed] })

  const notificationEmbed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(
      `Yay! 🎉 This channel has been set as the updates channel for Mochi! All my future updates will be sent here. Get ready for some awesome notifications! 💖`
    )
  await channel.send({ embeds: [notificationEmbed] })
}

async function addStaffRole(interaction, role, settings) {
  if (!settings.server.staff_roles) {
    settings.server.staff_roles = []
  }

  if (settings.server.staff_roles.includes(role.id)) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.WARNING)
      .setDescription(
        `Silly you! 😋 The role ${role} is already a staff role! Did you forget? It's okay, I still think you're awesome! ✨`
      )
    return interaction.followUp({ embeds: [embed] })
  }

  if (settings.server.staff_roles.length >= 5) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.WARNING)
      .setDescription(
        `Oops! You already have 5 staff roles. That's a lot! 😮 Maybe we can have a role party and remove one before adding a new one? Current staff roles: ${settings.server.staff_roles.map(id => `<@&${id}>`).join(', ')}`
      )
    return interaction.followUp({ embeds: [embed] })
  }

  settings.server.staff_roles.push(role.id)
  await updateSetupStatus(settings)
  await settings.save()

  const setupEmbed = createSetupEmbed(settings)
  await interaction.followUp({ embeds: [setupEmbed] })
}

async function removeStaffRole(interaction, role, settings) {
  if (
    !settings.server.staff_roles ||
    !settings.server.staff_roles.includes(role.id)
  ) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.WARNING)
      .setDescription(
        `Hmm... 🤔 The role ${role} isn't a staff role right now. Are you sure you picked the right one? Don't worry, we all make mistakes sometimes! 💖`
      )
    return interaction.followUp({ embeds: [embed] })
  }

  settings.server.staff_roles = settings.server.staff_roles.filter(
    id => id !== role.id
  )
  await updateSetupStatus(settings)
  await settings.save()

  const setupEmbed = createSetupEmbed(settings)
  await interaction.followUp({ embeds: [setupEmbed] })
}

async function updateSetupStatus(settings) {
  settings.server.setup_completed =
    settings.server.updates_channel &&
    settings.server.staff_roles &&
    settings.server.staff_roles.length > 0
}

function createSetupEmbed(settings) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle("Mochi's Setup Status 📊")
    .setDescription("Heya! Let's check out your setup progress! 💖")
    .addFields(
      {
        name: 'Updates Channel',
        value: settings.server.updates_channel
          ? `✅ Set to <#${settings.server.updates_channel}>`
          : '❌ Not set yet\nUse `/settings updateschannel` to set it up!',
      },
      {
        name: 'Staff Roles',
        value:
          settings.server.staff_roles && settings.server.staff_roles.length > 0
            ? `✅ ${settings.server.staff_roles.map(id => `<@&${id}>`).join(', ')}`
            : '❌ No staff roles set\nUse `/settings staffadd` to add a staff role!',
      }
    )

  if (settings.server.setup_completed) {
    embed.setFooter({ text: "Yay! Your setup is complete! You're amazing! 🎉" })
  } else {
    embed.setFooter({
      text: "Almost there! Complete the setup to unlock all of Mochi's awesome features! 💕",
    })
  }

  return embed
}

async function statusSettings(interaction, settings) {
  const allFields = [
    {
      name: '1. Updates Channel 📢',
      value: settings.server.updates_channel
        ? `- Updates Channel set to <#${settings.server.updates_channel}> ✨\n> Use \`/settings updateschannel\` to change it`
        : "- Oopsie! 🙈 We haven't set this up yet.\n> Use `/settings updateschannel` to get all the cool updates!",
    },
    {
      name: '2. Staff Roles 👑',
      value:
        settings.server.staff_roles && settings.server.staff_roles.length > 0
          ? `- Current staff roles: ${settings.server.staff_roles.map(id => `<@&${id}>`).join(', ')} ✨\n> Use \`/settings staffadd/staffremove\` to manage staff roles`
          : "- Uh-oh! 😮 We don't have any staff roles yet. \n> Add some with `/settings staffadd`!",
    },
    {
      name: '3. Stats 📊',
      value: `1. XP/Leveling: ${settings.stats.enabled ? "✅ Let's level up! 🎮" : "❌ Aww, XP/Leveling's off. We're missing out! 😢"}\n2. Invite Tracking: ${settings.invite.tracking ? "✅ We're keeping track!" : "❌ Oh no, we're not tracking invites. 😕"}\n> Want to change these? Use \`/levelup\` for XP stuff and \`/invites\` for invite tracking!`,
    },
    {
      name: '4. Modlog 📝',
      value: settings.modlog_channel
        ? `- Modlog is all set up in <#${settings.modlog_channel}>!\n> Use \`/modlog\` to change it`
        : "- Oops! 🙊 We don't have a modlog channel yet.\n> Let's set one up with `/modlog`!",
    },
    {
      name: '5. Welcome & Farewell 👋',
      value: `1. Welcome: ${settings.welcome?.enabled ? "✅ We're greeting new friends! 🤗" : "❌ Aww, we're not saying hi to newbies. 😢"}\n2. Farewell: ${settings.farewell?.enabled ? "✅ We're saying bye-bye! 👋" : "❌ We're not saying goodbye. So sad! 😭"}\n> Wanna change this? Use \`/welcome\` and \`/farewell\` to make it just right!`,
    },
    {
      name: '6. Tickets 🎫',
      value: settings.ticket?.enabled
        ? `- Ticket system is up and running! Category: ${settings.ticket.category || "Not set yet, but that's okay!"}\n> Use \`/tickets\` to manage tickets!`
        : "- Uh-oh! 😮 Our ticket system isn't set up.\n> Let's fix that with `/tickets setup`!",
    },
    {
      name: '7. Automod 🛡️',
      value: `- Automod ${settings.automod?.debug ? 'is in debug mode' : 'is active'}!\n- Strikes: ${settings.automod?.strikes || 10}, Action: ${settings.automod?.action || 'TIMEOUT'}\n> Use \`/automod\` to configure automod settings!`,
    },
    {
      name: '8. Max Warn Settings ⚠️',
      value: `- Action: ${settings.max_warn?.action || 'KICK'}, Limit: ${settings.max_warn?.limit || 5}\n> Use \`/warnconfig\` to adjust these settings!`,
    },
    {
      name: '9. Counters 🔢',
      value:
        settings.counters && settings.counters.length > 0
          ? `- ${settings.counters.length} counter${settings.counters.length > 1 ? 's' : ''} set up!\n> Use \`/counter\` to manage your counters!`
          : "- No counters set up yet. Let's add some with `/counter`!",
    },
    {
      name: '10. Autorole 🎭',
      value: settings.autorole
        ? `- Autorole is set to <@&${settings.autorole}>!\n> Use \`/autorole\` to change it`
        : "- Autorole isn't set up. Use `/autorole` to automatically assign roles to new members!",
    },
    {
      name: '11. Suggestions 💡',
      value: settings.suggestions?.enabled
        ? `- Suggestions are enabled! Channel: <#${settings.suggestions.channel_id}>\n> Use \`/suggestion\` to manage suggestion settings!`
        : '- Suggestions are not set up. Enable them with `/suggestion`!',
    },
  ]

  // Add Giveaways information if there are any active giveaways
  const giveawaysManager = interaction.client.giveawaysManager
  const allGiveaways = await giveawaysManager.getAllGiveaways()
  const activeGiveaways = allGiveaways.filter(
    giveaway => !giveaway.ended && giveaway.guildId === interaction.guild.id
  )

  if (activeGiveaways.length > 0) {
    const giveawayInfo = await Promise.all(
      activeGiveaways.map(async giveaway => {
        const channel = await interaction.guild.channels
          .fetch(giveaway.channelId)
          .catch(() => null)
        const timeLeft = giveaway.endAt - Date.now()

        let status = '🏁 Running'
        if (giveaway.pauseOptions && giveaway.pauseOptions.isPaused) {
          status = '⏸️ Paused'
        } else if (timeLeft <= 0) {
          status = '🎊 Ended'
        }

        return `🎉 Prize: ${giveaway.prize}, [📨 Message](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}), 📍 Channel: ${channel ? `<#${channel.id}>` : 'IDK'}
        🕒 Ends: ${timeLeft > 0 ? `<t:${Math.floor(giveaway.endAt / 1000)}:R>` : 'Ended'}, 👥 Winners: ${giveaway.winnerCount}
        🏆 Hosted by: ${giveaway.hostedBy ? `${giveaway.hostedBy}` : 'IDK'}, 📊 Status: ${status}`
      })
    )

    allFields.push({
      name: '12. Active Giveaways 🎁',
      value: `${activeGiveaways.length} active giveaway(s):\n\n${giveawayInfo.join('\n\n')}\n\n> Use \`/giveaway\` to manage giveaways!`,
    })
  }

  // Add Reaction Roles information if there are any set up
  const reactionRoles = await ReactionRoleModel.find({
    guild_id: interaction.guild.id,
  }).lean()

  if (reactionRoles.length > 0) {
    const rrInfo = await Promise.all(
      reactionRoles.map(async rr => {
        const channel = await interaction.guild.channels
          .fetch(rr.channel_id)
          .catch(() => null)
        const rolesMentions = rr.roles
          .map(role => `${role.emote} <@&${role.role_id}>`)
          .join(', ')

        return `📌 [Message](https://discord.com/channels/${rr.guild_id}/${rr.channel_id}/${rr.message_id}) in ${channel ? `<#${channel.id}>` : 'Unknown Channel'}\n   Roles: ${rolesMentions}`
      })
    )

    allFields.push({
      name: '13. Reaction Roles 🎭',
      value: `${reactionRoles.length} reaction role message(s) set up:\n\n${rrInfo.join('\n\n')}\n\n> Use \`/reactionrole\` to manage reaction roles!`,
    })
  }

  const totalPages = Math.ceil(allFields.length / 4)
  let currentPage = 1

  const generateEmbed = page => {
    const startIndex = (page - 1) * 4
    const endIndex = startIndex + 4
    const fieldsToShow = allFields.slice(startIndex, endIndex)

    return new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("Mochi's current Settings")
      .setDescription(
        "Hey there! Let's take a peek at your current settings! I'm so excited to show you what we've got set up! 🎉"
      )
      .addFields(fieldsToShow)
      .setFooter({
        text: `Page ${page}/${totalPages} • Remember, I'm always here to help you set things up! Don't be shy to ask! 💖`,
      })
  }
  const generateButtons = page => {
    const row = new ActionRowBuilder()

    if (page > 1) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬅️')
      )
    }

    if (page < totalPages) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➡️')
      )
    }

    return row
  }

  const initialEmbed = generateEmbed(currentPage)
  const initialButtons = generateButtons(currentPage)

  const reply = await interaction.followUp({
    embeds: [initialEmbed],
    components: [initialButtons],
  })

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 890000, // Set to 14 minutes and 50 seconds (just under Discord's 15-minute limit)
  })

  collector.on('collect', async i => {
    if (i.customId === 'prev') {
      currentPage--
    } else if (i.customId === 'next') {
      currentPage++
    }

    const newEmbed = generateEmbed(currentPage)
    const newButtons = generateButtons(currentPage)

    try {
      await i.update({ embeds: [newEmbed], components: [newButtons] })
    } catch (error) {
      console.error('Failed to update interaction:', error)
      // Attempt to send a new message if updating fails
      try {
        await i.followUp({
          content:
            "Oopsie! 😅 I had a little hiccup updating the message. Here's a fresh one for you!",
          embeds: [newEmbed],
          components: [newButtons],
          ephemeral: true,
        })
      } catch (followUpError) {
        console.error('Failed to send follow-up message:', followUpError)
      }
    }
  })

  collector.on('end', () => {
    try {
      reply.edit({ components: [] })
    } catch (error) {
      console.error('Failed to remove components after collector end:', error)
    }
  })
}
