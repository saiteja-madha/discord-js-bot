const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'flagtranslation',
  description: 'configure flag translation in the server',
  category: 'ADMIN',
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
    const response = await setFlagTranslation(
      interaction.options.getString('status'),
      data.settings
    )
    await interaction.followUp(response)
  },
}

async function setFlagTranslation(input, settings) {
  const status = input.toLowerCase() === 'on' ? true : false

  settings.flag_translation.enabled = status
  await settings.save()

  return `Configuration saved! Flag translation is now ${status ? 'enabled' : 'disabled'}`
}
