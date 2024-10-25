const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'autorole',
  description: 'Set up a role to be given when a member joins the server!',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'add',
        description: 'Setup the autorole ✨',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'role',
            description: 'The role to be given',
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: 'role_id',
            description: 'The role ID to be given',
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: 'remove',
        description: 'Disable the autorole',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    let response

    // Add autorole
    if (sub === 'add') {
      let role = interaction.options.getRole('role')
      if (!role) {
        const role_id = interaction.options.getString('role_id')
        if (!role_id)
          return interaction.followUp(
            'Please provide a role or role ID, okay? 🥺✨'
          )

        const roles = interaction.guild.findMatchingRoles(role_id)
        if (roles.length === 0)
          return interaction.followUp(
            'Oh no! No matching roles found. Please try again! 😢'
          )

        role = roles[0]
      }

      response = await setAutoRole(interaction, role, data.settings)
    }

    // Remove autorole
    else if (sub === 'remove') {
      response = await setAutoRole(interaction, null, data.settings)
    }

    // Default case
    else response = 'Oops! Invalid subcommand. Please try again! 🤔'

    await interaction.followUp(response)
  },
}

/**
 * @param {import("discord.js").CommandInteraction} interaction
 * @param {import("discord.js").Role} role
 * @param {import("@models/Guild")} settings
 */
async function setAutoRole(interaction, role, settings) {
  const guild = interaction.guild

  if (role) {
    if (role.id === guild.roles.everyone.id)
      return "Oh no! You cannot set `@everyone` as the autorole! That wouldn't be fair! 🙅‍♀️✨"
    if (!guild.members.me.permissions.has('ManageRoles'))
      return "Oops! I don't have the `ManageRoles` permission. Please check my permissions! 🥺"
    if (guild.members.me.roles.highest.position < role.position)
      return "Yikes! I don't have the permissions to assign this role. Is it higher than mine? 😟"
    if (role.managed)
      return "Oops! This role is managed by an integration, so I can't assign it! 😭"
  }

  // Setting or disabling the autorole
  if (!role) settings.autorole = null
  else settings.autorole = role.id

  await settings.save()
  return `Yay! 🎉 Configuration saved! Autorole is now ${!role ? 'disabled' : 'set up!'} ✨`
}
