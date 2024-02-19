const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'anti',
  description: 'manage various automod settings for the server',
  category: 'AUTOMOD',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'ghostping',
        description: 'detects and logs ghost mentions in your server',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'configuration status',
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
      {
        name: 'spam',
        description: 'enable or disable antispam detection',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'configuration status',
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
      {
        name: 'massmention',
        description: 'enable or disable massmention detection',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'status',
            description: 'configuration status',
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
          {
            name: 'threshold',
            description: 'configuration threshold (default is 3 mentions)',
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand()
    const settings = data.settings

    let response
    if (sub == 'ghostping')
      response = await antiGhostPing(
        settings,
        interaction.options.getString('status')
      )
    else if (sub == 'spam')
      response = await antiSpam(
        settings,
        interaction.options.getString('status')
      )
    else if (sub === 'massmention') {
      response = await antiMassMention(
        settings,
        interaction.options.getString('status'),
        interaction.options.getInteger('threshold')
      )
    } else response = 'Invalid command usage!'

    await interaction.followUp(response)
  },
}

async function antiGhostPing(settings, input) {
  const status = input.toUpperCase() === 'ON' ? true : false
  settings.automod.anti_ghostping = status
  await settings.save()
  return `Configuration saved! Anti-Ghostping is now ${status ? 'enabled' : 'disabled'}`
}

async function antiSpam(settings, input) {
  const status = input.toUpperCase() === 'ON' ? true : false
  settings.automod.anti_spam = status
  await settings.save()
  return `Antispam detection is now ${status ? 'enabled' : 'disabled'}`
}

async function antiMassMention(settings, input, threshold) {
  const status = input.toUpperCase() === 'ON' ? true : false
  if (!status) {
    settings.automod.anti_massmention = 0
  } else {
    settings.automod.anti_massmention = threshold
  }
  await settings.save()
  return `Mass mention detection is now ${status ? 'enabled' : 'disabled'}`
}
