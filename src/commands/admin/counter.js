const { ApplicationCommandOptionType, ChannelType } = require('discord.js')

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'counter',
  description: 'Set up a counter channel in the guild!',
  category: 'ADMIN',
  userPermissions: ['ManageGuild'],
  botPermissions: ['ManageChannels'],
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'type',
        description: 'Type of counter channel ',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: 'Users',
            value: 'USERS',
          },
          {
            name: 'Members',
            value: 'MEMBERS',
          },
          {
            name: 'Bots',
            value: 'BOTS',
          },
        ],
      },
      {
        name: 'name',
        description: 'Name of the counter channel',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction, data) {
    const type = interaction.options.getString('type')
    const name = interaction.options.getString('name')

    const response = await setupCounter(
      interaction.guild,
      type.toUpperCase(),
      name,
      data.settings
    )
    return interaction.followUp(response)
  },
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} type
 * @param {string} name
 * @param {object} settings
 */
async function setupCounter(guild, type, name, settings) {
  let channelName = name

  const stats = await guild.fetchMemberStats()
  if (type === 'USERS') channelName += ` : ${stats[0]} 👥`
  else if (type === 'MEMBERS') channelName += ` : ${stats[2]}`
  else if (type === 'BOTS') channelName += ` : ${stats[1]} 🤖`

  const vc = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: ['Connect'],
      },
      {
        id: guild.members.me.id,
        allow: ['ViewChannel', 'ManageChannels', 'Connect'],
      },
    ],
  })

  const exists = settings.counters.find(
    v => v.counter_type.toUpperCase() === type
  )
  if (exists) {
    exists.name = name
    exists.channel_id = vc.id
  } else {
    settings.counters.push({
      counter_type: type,
      channel_id: vc.id,
      name,
    })
  }

  settings.server.bots = stats[1]
  await settings.save()

  return `Yay! 🎉 Configuration saved! Counter channel \`${channelName}\` created successfully! ✨`
}
