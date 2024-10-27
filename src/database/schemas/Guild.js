// @root/src/database/schemas/Guild.js

const mongoose = require('mongoose')
const { CACHE_SIZE, STATS } = require('../../config')
const FixedSizeMap = require('fixedsize-map')
const { getUser } = require('./User')

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS)

const Schema = new mongoose.Schema({
  _id: String,
  server: {
    name: String,
    region: String,
    owner: { type: String, ref: 'users' },
    joinedAt: Date,
    leftAt: Date,
    bots: { type: Number, default: 0 },
    updates_channel: { type: String, default: null },
    staff_roles: [String],
    setup_completed: { type: Boolean, default: false },
    setup_message_id: { type: String, default: null },
    invite_link: { type: String, default: null },
  },
  stats: {
    enabled: { type: Boolean, default: true },
    xp: {
      message: { type: String, default: STATS.DEFAULT_LVL_UP_MSG },
      channel: String,
    },
  },
  ticket: {
    log_channel: String,
    limit: { type: Number, default: 10 },
    category: { type: String, default: null },
    enabled: { type: Boolean, default: false },
    topics: [
      {
        _id: false,
        name: String,
      },
    ],
  },
  automod: {
    debug: Boolean,
    strikes: { type: Number, default: 10 },
    action: { type: String, default: 'TIMEOUT' },
    wh_channels: [String],
    anti_attachments: Boolean,
    anti_invites: Boolean,
    anti_links: Boolean,
    anti_spam: Boolean,
    anti_ghostping: Boolean,
    anti_massmention: Number,
    max_lines: Number,
  },
  invite: {
    tracking: { type: Boolean, default: true },
    ranks: [
      {
        invites: { type: Number, required: true },
        _id: { type: String, required: true },
      },
    ],
  },

  logs_channel: String,
  logs: {
    enabled: { type: Boolean, default: false },
    member: {
      message_edit: { type: Boolean, default: false },
      message_delete: { type: Boolean, default: false },
      role_changes: { type: Boolean, default: false },
    },
    channel: {
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    role: {
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },

  max_warn: {
    action: {
      type: String,
      enum: ['TIMEOUT', 'KICK', 'BAN'],
      default: 'KICK',
    },
    limit: { type: Number, default: 5 },
  },
  counters: [
    {
      _id: false,
      counter_type: String,
      name: String,
      channel_id: String,
    },
  ],
  welcome: {
    enabled: Boolean,
    channel: String,
    content: String,
    embed: {
      description: String,
      color: String,
      thumbnail: Boolean,
      footer: String,
      image: String,
    },
  },
  farewell: {
    enabled: Boolean,
    channel: String,
    content: String,
    embed: {
      description: String,
      color: String,
      thumbnail: Boolean,
      footer: String,
      image: String,
    },
  },
  autorole: String,
  suggestions: {
    enabled: Boolean,
    channel_id: String,
    approved_channel: String,
    rejected_channel: String,
  },
})

const Model = mongoose.model('guild', Schema)

async function getSettings(guild) {
  if (!guild) throw new Error('Guild is undefined')
  if (!guild.id) throw new Error('Guild Id is undefined')

  const cached = cache.get(guild.id)
  if (cached) return cached

  let guildData = await Model.findById(guild.id)
  if (!guildData) {
    // save owner details
    guild
      .fetchOwner()
      .then(async owner => {
        const userDb = await getUser(owner)
        await userDb.save()
      })
      .catch(ex => {})

    // create a new guild model
    guildData = new Model({
      _id: guild.id,
      server: {
        name: guild.name,
        region: guild.preferredLocale,
        owner: guild.ownerId,
        joinedAt: guild.joinedAt,
      },
    })

    await guildData.save()
  }
  cache.add(guild.id, guildData)
  return guildData
}

async function updateSettings(guildId, settings) {
  if (settings.server && settings.server.staff_roles) {
    settings.server.staff_roles = Array.isArray(settings.server.staff_roles)
      ? settings.server.staff_roles
      : [settings.server.staff_roles]
  }

  // Check if a ticket message is set and update the enabled status
  if (settings.ticket && settings.ticket.message_id) {
    settings.ticket.enabled = true
  }

  const updatedSettings = await Model.findByIdAndUpdate(guildId, settings, {
    new: true,
  })
  cache.add(guildId, updatedSettings)
  return updatedSettings
}

async function setInviteLink(guildId, inviteLink) {
  const updatedSettings = await Model.findByIdAndUpdate(
    guildId,
    { 'server.invite_link': inviteLink },
    { new: true }
  )
  cache.add(guildId, updatedSettings)
  return updatedSettings
}

module.exports = {
  getSettings,
  updateSettings,
  setInviteLink,
}