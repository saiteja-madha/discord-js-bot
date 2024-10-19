const { getSettings } = require('@schemas/Guild')
const express = require('express')
const utils = require('../utils')
const CheckAuth = require('../auth/CheckAuth')
const router = express.Router()

router.get('/:serverID', CheckAuth, async (req, res) => {
  res.redirect(`/manage/${req.params.serverID}/basic`)
})

router.get('/:serverID/basic', CheckAuth, async (req, res) => {
  // Check if the user has the permissions to edit this guild
  const guild = req.client.guilds.cache.get(req.params.serverID)
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find(g => g.id === req.params.serverID)
  ) {
    return res.render('404', {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    })
  }

  // Fetch guild information
  const guildInfos = await utils.fetchGuild(
    guild.id,
    req.client,
    req.user.guilds
  )

  res.render('manager/basic', {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
  })
})

router.post('/:serverID/basic', CheckAuth, async (req, res) => {
  const guild = req.client.guilds.cache.get(req.params.serverID)
  if (
    !guild ||
    !req.userInfos.displayedGuilds ||
    !req.userInfos.displayedGuilds.find(g => g.id === req.params.serverID)
  ) {
    return res.render('404', {
      user: req.userInfos,
      currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    })
  }

  const settings = await getSettings(guild)
  const data = req.body

  // BASIC CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'basicUpdate')) {
    settings.server.name = guild.name
    settings.server.region = guild.preferredLocale
    settings.server.owner = guild.ownerId
    settings.server.joinedAt = guild.joinedAt

    if (data.updates_channel) {
      settings.server.updates_channel =
        guild.channels.cache.get(data.updates_channel)?.id || null
    }

    if (data.staff_roles) {
      settings.server.staff_roles = Array.isArray(data.staff_roles)
        ? data.staff_roles
        : [data.staff_roles]
    }

    settings.server.setup_completed = data.setup_completed === 'on'
    settings.server.invite_link = data.invite_link || null
  }

  // STATS CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'statsUpdate')) {
    settings.stats.enabled = data.ranking === 'on'
    settings.stats.xp.message =
      data.levelup_message || settings.stats.xp.message
    settings.stats.xp.channel =
      guild.channels.cache.get(data.levelup_channel)?.id || null
  }

  // TICKET CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'ticketUpdate')) {
    settings.ticket.limit = parseInt(data.limit) || settings.ticket.limit
    settings.ticket.log_channel =
      guild.channels.cache.get(data.log_channel)?.id || null
    settings.ticket.category =
      guild.channels.cache.get(data.category)?.id || null
    settings.ticket.enabled = data.ticket_enabled === 'on'

    // Update ticket topics if provided
    if (data.ticket_topics) {
      settings.ticket.topics = data.ticket_topics.map(topic => ({
        name: topic,
      }))
    }
  }

  // AUTOMOD CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'automodUpdate')) {
    settings.automod.debug = data.debug === 'on'
    settings.automod.strikes =
      parseInt(data.max_strikes) || settings.automod.strikes
    settings.automod.action = data.automod_action || settings.automod.action
    settings.automod.wh_channels = data.wh_channels || []
    settings.automod.anti_attachments = data.anti_attachments === 'on'
    settings.automod.anti_invites = data.anti_invites === 'on'
    settings.automod.anti_links = data.anti_links === 'on'
    settings.automod.anti_spam = data.anti_spam === 'on'
    settings.automod.anti_ghostping = data.anti_ghostping === 'on'
    settings.automod.anti_massmention = parseInt(data.anti_massmention) || null
    settings.automod.max_lines = parseInt(data.max_lines) || null
  }

  // LOGS CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'logsUpdate')) {
    settings.logs.enabled = data.logs_enabled === 'on'
    settings.logs_channel =
      guild.channels.cache.get(data.logs_channel)?.id || null

    // Update detailed logging preferences
    settings.logs.member = {
      message_edit: data.log_message_edit === 'on',
      message_delete: data.log_message_delete === 'on',
      role_changes: data.log_role_changes === 'on',
    }
    settings.logs.channel = {
      create: data.log_channel_create === 'on',
      edit: data.log_channel_edit === 'on',
      delete: data.log_channel_delete === 'on',
    }
    settings.logs.role = {
      create: data.log_role_create === 'on',
      edit: data.log_role_edit === 'on',
      delete: data.log_role_delete === 'on',
    }
  }

  // MAX WARN CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'maxWarnUpdate')) {
    settings.max_warn.action = data.max_warn_action || settings.max_warn.action
    settings.max_warn.limit =
      parseInt(data.max_warn_limit) || settings.max_warn.limit
  }

  // WELCOME CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'welcomeUpdate')) {
    settings.welcome.enabled = data.welcome_enabled === 'on'
    settings.welcome.channel =
      guild.channels.cache.get(data.welcome_channel)?.id || null
    settings.welcome.content = data.welcome_content || ''
    settings.welcome.embed = {
      description: data.welcome_embed_description || '',
      color: data.welcome_embed_color || '#000000',
      thumbnail: data.welcome_embed_thumbnail === 'on',
      footer: data.welcome_embed_footer || '',
      image: data.welcome_embed_image || '',
    }
  }

  // FAREWELL CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'farewellUpdate')) {
    settings.farewell.enabled = data.farewell_enabled === 'on'
    settings.farewell.channel =
      guild.channels.cache.get(data.farewell_channel)?.id || null
    settings.farewell.content = data.farewell_content || ''
    settings.farewell.embed = {
      description: data.farewell_embed_description || '',
      color: data.farewell_embed_color || '#000000',
      thumbnail: data.farewell_embed_thumbnail === 'on',
      footer: data.farewell_embed_footer || '',
      image: data.farewell_embed_image || '',
    }
  }

  // AUTOROLE CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'autoroleUpdate')) {
    settings.autorole = guild.roles.cache.get(data.autorole)?.id || null
  }

  // SUGGESTIONS CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, 'suggestionsUpdate')) {
    settings.suggestions = {
      enabled: data.suggestions_enabled === 'on',
      channel_id:
        guild.channels.cache.get(data.suggestions_channel)?.id || null,
      approved_channel:
        guild.channels.cache.get(data.suggestions_approved_channel)?.id || null,
      rejected_channel:
        guild.channels.cache.get(data.suggestions_rejected_channel)?.id || null,
    }
  }

  await settings.save()
  res.redirect(303, `/manage/${guild.id}/basic`)
})

module.exports = router
