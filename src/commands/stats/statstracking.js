const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'statstracking',
  description: 'enable or disable tracking stats in the server',
  category: 'STATS',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'status',
        description: 'enabled or disabled',
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'ON',
            value: 'ON',
          },
          {
            name: 'OFF',
            value: 'OFF',
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const response = await setStatus(
      interaction.options.getString('status'),
      data.settings
    )
    await interaction.followUp(response)
  },
}

async function setStatus(input, settings) {
  const status = input.toLowerCase() === 'on' ? true : false

  settings.stats.enabled = status
  await settings.save()

  return `Configuration saved! Stats Tracking is now ${status ? 'enabled' : 'disabled'}`
}
