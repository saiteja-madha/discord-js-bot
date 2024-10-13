const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js')
const { getSettings, updateSettings } = require('@schemas/Guild')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'onboard',
  description: "Manage Mochi's onboarding settings for this server",
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  botPermissions: ['EmbedLinks'],

  slashCommand: {
    ephemeral: true,
    enabled: true,
    options: [
      {
        name: 'status',
        description: 'View current Mochi onboarding status',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'update',
        description: "Update Mochi's onboarding settings",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'setting',
            description: 'Setting to update',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              { name: 'Updates Channel', value: 'updates_channel' },
              { name: 'Staff Role', value: 'staff_role' },
            ],
          },
          {
            name: 'value',
            description: 'New value for the setting',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'setup',
        description: 'Run the initial setup for Mochi',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const subCommand = interaction.options.getSubcommand()

    // Check if the user has the Manage Guild permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.followUp(
        "Oopsie! You need the 'Manage Server' permission to use this command. (◞‸◟；) Ask a server admin for help~"
      )
    }

    const settings = await getSettings(interaction.guild)

    switch (subCommand) {
      case 'view':
        return await viewCommand(interaction, settings)
      case 'update':
        return await updateCommand(interaction, settings)
      case 'setup':
        return await setupCommand(interaction)
    }
  },
}

async function viewCommand(interaction, settings) {
  const embed = new EmbedBuilder()
    .setColor('#FFC0CB')
    .setTitle('Mochi Settings ♡(>ᴗ•)')
    .addFields(
      {
        name: 'Updates Channel',
        value: settings.updates_channel
          ? `<#${settings.updates_channel}>`
          : 'Not set',
        inline: true,
      },
      {
        name: 'Staff Role',
        value: settings.staff_role ? `<@&${settings.staff_role}>` : 'Not set',
        inline: true,
      },
      {
        name: 'Setup Completed',
        value: settings.setup_completed ? 'Yes' : 'No',
        inline: true,
      }
    )
    .setFooter({ text: 'Mochi is happy to serve you~ ♡' })

  await interaction.followUp({ embeds: [embed] })
}

async function updateCommand(interaction, settings) {
  const setting = interaction.options.getString('setting')
  const value = interaction.options.getString('value')

  switch (setting) {
    case 'updates_channel':
      const channel = interaction.guild.channels.cache.find(
        c => c.name.toLowerCase() === value.toLowerCase()
      )
      if (!channel)
        return interaction.followUp(
          "Oopsie! I couldn't find that channel. (◞‸◟；) Can you double-check the name?"
        )
      settings.updates_channel = channel.id
      break
    case 'staff_role':
      const role = interaction.guild.roles.cache.find(
        r => r.name.toLowerCase() === value.toLowerCase()
      )
      if (!role)
        return interaction.followUp(
          "Uh-oh! I couldn't find that role. (╥﹏╥) Can you make sure it exists?"
        )
      settings.staff_role = role.id
      break
  }

  await updateSettings(interaction.guild.id, settings)

  await interaction.followUp(
    `Yay! I've updated the ${setting.replace('_', ' ')} to ${value}~ (≧◡≦)`
  )
}

async function setupCommand(interaction) {
  const { sendOnboardingMenu } = require('@handlers/guild')
  await sendOnboardingMenu(interaction.channel)
  await interaction.followUp(
    "I've started the setup process in this channel! Let's make everything super cute together~ ♡"
  )
}
