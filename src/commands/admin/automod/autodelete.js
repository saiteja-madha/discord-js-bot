const { ApplicationCommandOptionType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'autodelete',
  description: 'manage the autodelete settings for the server',
  category: 'AUTOMOD',
  userPermissions: ['ManageGuild'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'attachments',
        description: 'allow or disallow attachments in messages',
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
        name: 'invites',
        description: 'allow or disallow discord invites in messages',
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
        name: 'links',
        description: 'allow or disallow links in messages',
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
        name: 'maxlines',
        description: 'sets maximum lines allowed per message',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'amount',
            description: 'configuration amount (0 to disable)',
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

    if (sub == 'attachments') {
      response = await antiAttachments(
        settings,
        interaction.options.getString('status')
      )
    } else if (sub === 'invites')
      response = await antiInvites(
        settings,
        interaction.options.getString('status')
      )
    else if (sub == 'links')
      response = await antilinks(
        settings,
        interaction.options.getString('status')
      )
    else if (sub === 'maxlines')
      response = await maxLines(
        settings,
        interaction.options.getInteger('amount')
      )
    else response = 'Invalid command usage!'

    await interaction.followUp(response)
  },
}

async function antiAttachments(settings, input) {
  const status = input.toUpperCase() === 'ON' ? true : false
  settings.automod.anti_attachments = status
  await settings.save()
  return `Messages ${
    status
      ? 'with attachments will now be automatically deleted'
      : 'will not be filtered for attachments now'
  }`
}

async function antiInvites(settings, input) {
  const status = input.toUpperCase() === 'ON' ? true : false
  settings.automod.anti_invites = status
  await settings.save()
  return `Messages ${
    status
      ? 'with discord invites will now be automatically deleted'
      : 'will not be filtered for discord invites now'
  }`
}

async function antilinks(settings, input) {
  const status = input.toUpperCase() === 'ON' ? true : false
  settings.automod.anti_links = status
  await settings.save()
  return `Messages ${status ? 'with links will now be automatically deleted' : 'will not be filtered for links now'}`
}

async function maxLines(settings, input) {
  const lines = Number.parseInt(input)
  if (isNaN(lines)) return 'Please enter a valid number input'

  settings.automod.max_lines = lines
  await settings.save()
  return `${
    input === 0
      ? 'Maximum line limit is disabled'
      : `Messages longer than \`${input}\` lines will now be automatically deleted`
  }`
}
