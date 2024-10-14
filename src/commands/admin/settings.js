const {
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js')

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
  },
}

async function updateChannel(interaction, channel, settings) {
  if (
    !channel
      .permissionsFor(interaction.guild.members.me)
      .has(PermissionFlagsBits.SendMessages)
  ) {
    return interaction.followUp(
      "Oops! 😅 I don't have permission to send messages in that channel."
    )
  }

  settings.server.updates_channel = channel.id
  await settings.save()
  return interaction.followUp(
    `Awesome! 🎉 The updates channel has been set to ${channel}`
  )
}

async function addStaffRole(interaction, role, settings) {
  if (!settings.server.staff_roles) {
    settings.server.staff_roles = []
  }

  if (settings.server.staff_roles.includes(role.id)) {
    return interaction.followUp(`The role ${role} is already a staff role! 😊`)
  }

  if (settings.server.staff_roles.length >= 5) {
    return interaction.followUp(
      `Oops! You already have 5 staff roles. Please remove at least one role before adding a new one. Current staff roles: ${settings.server.staff_roles.map(id => `<@&${id}>`).join(', ')}`
    )
  }

  settings.server.staff_roles.push(role.id)
  await settings.save()

  return interaction.followUp(
    `Great job! 🌟 The role ${role} has been added as a staff role. Current staff roles: ${settings.server.staff_roles.map(id => `<@&${id}>`).join(', ')}`
  )
}

async function removeStaffRole(interaction, role, settings) {
  if (
    !settings.server.staff_roles ||
    !settings.server.staff_roles.includes(role.id)
  ) {
    return interaction.followUp(
      `The role ${role} is not currently a staff role. 🤔`
    )
  }

  settings.server.staff_roles = settings.server.staff_roles.filter(
    id => id !== role.id
  )
  await settings.save()

  const staffRolesMessage =
    settings.server.staff_roles.length > 0
      ? `Current staff roles: ${settings.server.staff_roles.map(id => `<@&${id}>`).join(', ')}`
      : 'There are no staff roles set.'

  return interaction.followUp(
    `The role ${role} has been removed from staff roles. ${staffRolesMessage}`
  )
}
