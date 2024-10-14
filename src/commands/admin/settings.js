const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')

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
