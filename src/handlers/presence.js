const { ActivityType } = require('discord.js')
const { getPresenceConfig } = require('@schemas/Dev')

/**
 * @param {import('@src/structures').BotClient} client
 */
async function updatePresence(client) {
  const config = await getPresenceConfig()

  if (!config.PRESENCE.ENABLED) {
    return client.user.setPresence({
      status: 'invisible',
      activities: [],
    })
  }

  let message = config.PRESENCE.MESSAGE

  if (message.includes('{servers}')) {
    message = message.replaceAll('{servers}', client.guilds.cache.size)
  }

  if (message.includes('{members}')) {
    const members = client.guilds.cache
      .map(g => g.memberCount)
      .reduce((partial_sum, a) => partial_sum + a, 0)
    message = message.replaceAll('{members}', members)
  }

  const getType = type => {
    switch (type) {
      case 'COMPETING':
        return ActivityType.Competing
      case 'LISTENING':
        return ActivityType.Listening
      case 'PLAYING':
        return ActivityType.Playing
      case 'WATCHING':
        return ActivityType.Watching
      case 'STREAMING':
        return ActivityType.Streaming
      case 'CUSTOM':
        return ActivityType.Custom
      default:
        return ActivityType.Playing
    }
  }

  const activity = {
    name: message,
    type: getType(config.PRESENCE.TYPE),
  }

  // Handle streaming activity type with URL support
  if (config.PRESENCE.TYPE === 'STREAMING') {
    activity.url = config.PRESENCE.URL
  }

  // Handle custom status with emoji and state
  if (config.PRESENCE.TYPE === 'CUSTOM') {
    activity.state = config.PRESENCE.MESSAGE
  }

  await client.user.setPresence({
    status: config.PRESENCE.STATUS,
    activities: [activity],
  })

  // Log the presence update
  client.logger.log(
    `Presence Updated: STATUS:${config.PRESENCE.STATUS}, TYPE:${config.PRESENCE.TYPE}`
  )
}

/**
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async function handlePresence(client) {
  await updatePresence(client)
  setInterval(() => updatePresence(client), 10 * 60 * 1000)
}
