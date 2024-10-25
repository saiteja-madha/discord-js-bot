const {
  counterHandler,
  inviteHandler,
  presenceHandler,
} = require('@src/handlers')
const { cacheReactionRoles } = require('@schemas/ReactionRoles')
const { getSettings } = require('@schemas/Guild')
const { getPresenceConfig, getDevCommandsConfig } = require('@schemas/Dev')
const { ApplicationCommandType } = require('discord.js')

/**
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async client => {
  client.logger.success(`Logged in as ${client.user.tag}! (${client.user.id})`)

  // Initialize Music Manager
  if (client.config.MUSIC.ENABLED) {
    client.musicManager.connect(client.user.id)
    client.logger.success('Music Manager is all set up and ready to play!')
  }

  // Initialize Giveaways Manager
  if (client.config.GIVEAWAYS.ENABLED) {
    client.logger.log('Initializing the giveaways manager...')
    client.giveawaysManager
      ._init()
      .then(() => client.logger.success('Giveaway Manager is up and running!'))
  }

  // Initialize Presence Handler
  const presenceConfig = await getPresenceConfig()
  if (presenceConfig.PRESENCE.ENABLED) {
    await presenceHandler(client)

    const logPresence = () => {
      let message = presenceConfig.PRESENCE.MESSAGE

      // Process {servers} and {members} placeholders
      if (message.includes('{servers}')) {
        message = message.replaceAll('{servers}', client.guilds.cache.size)
      }

      if (message.includes('{members}')) {
        const members = client.guilds.cache
          .map(g => g.memberCount)
          .reduce((partial_sum, a) => partial_sum + a, 0)
        message = message.replaceAll('{members}', members)
      }

      client.logger.log(
        `Presence: STATUS:${presenceConfig.PRESENCE.STATUS}, TYPE:${presenceConfig.PRESENCE.TYPE}`
      )
    }

    // Log the initial presence update when the bot starts
    logPresence()
  }

  // Register Interactions
  if (client.config.INTERACTIONS.SLASH || client.config.INTERACTIONS.CONTEXT) {
    const devConfig = await getDevCommandsConfig()
  
    if (!client.config.INTERACTIONS.GLOBAL) {
    // Clear all global commands when GLOBAL is false
    await client.application.commands.set([])
    client.logger.success('Cleared all global commands (GLOBAL=false)')
  }
    // Register test guild commands
    const testGuild = client.guilds.cache.get(process.env.TEST_GUILD_ID)
    if (testGuild) {
      const testGuildCommands = client.slashCommands
        .filter(
          cmd =>
            // Keep test and dev commands
            cmd.testGuildOnly ||
            (cmd.devOnly && devConfig.ENABLED) ||
            // Only include regular commands if GLOBAL is true
            (!cmd.testGuildOnly &&
              !cmd.devOnly &&
              client.config.INTERACTIONS.GLOBAL)
        )
        .map(cmd => ({
          name: cmd.name,
          description: cmd.description,
          type: ApplicationCommandType.ChatInput,
          options: cmd.slashCommand.options,
        }))

      if (testGuildCommands.length > 0) {
        await testGuild.commands.set(testGuildCommands)
        client.logger.success(
          `Registered ${testGuildCommands.length} test guild commands`
        )
      }
    }

    // Register global commands
    if (client.config.INTERACTIONS.GLOBAL) {
      const globalCommands = client.slashCommands
        .filter(cmd => !cmd.testGuildOnly && !cmd.devOnly)
        .map(cmd => ({
          name: cmd.name,
          description: cmd.description,
          type: ApplicationCommandType.ChatInput,
          options: cmd.slashCommand.options,
        }))

      if (globalCommands.length > 0) {
        await client.application.commands.set(globalCommands)
        client.logger.success(
          `Registered ${globalCommands.length} global commands`
        )
      }
    }
  }

  // Load reaction roles to cache
  await cacheReactionRoles(client)

  for (const guild of client.guilds.cache.values()) {
    const settings = await getSettings(guild)

    // Initialize counter
    if (settings.counters.length > 0) {
      await counterHandler.init(guild, settings)
    }

    // Cache invites
    if (settings.invite.tracking) {
      inviteHandler.cacheGuildInvites(guild)
    }
  }

  setInterval(
    () => counterHandler.updateCounterChannels(client),
    10 * 60 * 1000
  )
}
