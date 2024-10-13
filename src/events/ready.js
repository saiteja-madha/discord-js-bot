const {
  counterHandler,
  inviteHandler,
  presenceHandler,
} = require('@src/handlers')
const { cacheReactionRoles } = require('@schemas/ReactionRoles')
const { getSettings } = require('@schemas/Guild')

/**
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async client => {
  client.logger.success(
    `✨ Yay! Logged in as ${client.user.tag}! (${client.user.id}) 🌟`
  )

  // Initialize Music Manager
  if (client.config.MUSIC.ENABLED) {
    client.musicManager.connect(client.user.id)
    client.logger.success(
      '🎶 Music Manager is all set up and ready to play! 💖'
    )
  }

  // Initialize Giveaways Manager
  if (client.config.GIVEAWAYS.ENABLED) {
    client.logger.log(
      '🎉 Time to spread some joy! Initializing the giveaways manager...'
    )
    client.giveawaysManager
      ._init()
      .then(() =>
        client.logger.success('🎁 Giveaway Manager is up and running! ✨')
      )
  }

  // Update Bot Presence
  if (client.config.PRESENCE.ENABLED) {
    presenceHandler(client)
    client.logger.log('🌈 Mochi is now ready to spread happiness and cheer! 💕')
  }

  // Register Interactions
  if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
    if (client.config.INTERACTIONS.GLOBAL) await client.registerInteractions()
    else
      await client.registerInteractions(
        client.config.INTERACTIONS.TEST_GUILD_ID
      )
    client.logger.log('🔗 Registered all the fun interactions! Let’s chat! 🎊')
  }

  // Load reaction roles to cache
  await cacheReactionRoles(client)
  client.logger.log('🔄 Cached all the reaction roles! Ready to react! 😄')

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild)

    // Initialize counter
    if (settings.counters.length > 0) {
      await counterHandler.init(guild, settings)
      client.logger.log(
        `🔢 Counter initialized for ${guild.name}! Let’s keep track of the fun! 🎈`
      )
    }

    // Cache invites
    if (settings.invite.tracking) {
      inviteHandler.cacheGuildInvites(guild)
      client.logger.log(
        `📜 Caching invites for ${guild.name}. Let’s invite more friends! 🎉`
      )
    }
  }

  setInterval(
    () => counterHandler.updateCounterChannels(client),
    10 * 60 * 1000
  )
  client.logger.log(
    '⏰ Counter channels will be updated every 10 minutes! Stay tuned! ✨'
  )
}
