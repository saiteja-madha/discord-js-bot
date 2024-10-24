const mongoose = require('mongoose')
const { CACHE_SIZE } = require('@src/config.js')
const FixedSizeMap = require('fixedsize-map')

const cache = new FixedSizeMap(CACHE_SIZE.USERS)

const FlagSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  flaggedBy: { type: String, required: true },
  flaggedAt: { type: Date, default: Date.now },
  serverId: { type: String, required: true },
  serverName: { type: String, required: true },
})

const ProfileSchema = new mongoose.Schema({
  pronouns: { type: String, default: null },
  age: { type: Number, default: null },
  region: { type: String, default: null },
  bio: { type: String, default: null, maxLength: 1000 },
  birthdate: { type: Date, default: null },
  interests: [{ type: String }],
  customFields: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  privacy: {
    showAge: { type: Boolean, default: true },
    showRegion: { type: Boolean, default: true },
    showBirthdate: { type: Boolean, default: false },
  },
})

const Schema = new mongoose.Schema(
  {
    _id: String,
    username: String,
    discriminator: String,
    logged: { type: Boolean, default: false },
    coins: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    reputation: {
      received: { type: Number, default: 0 },
      given: { type: Number, default: 0 },
      timestamp: Date,
    },
    daily: {
      streak: { type: Number, default: 0 },
      timestamp: Date,
    },
    flags: { type: [FlagSchema], default: [] },
    premium: {
      enabled: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },
    afk: {
      enabled: { type: Boolean, default: false },
      reason: { type: String, default: null },
      since: { type: Date, default: null },
      endTime: { type: Date, default: null },
    },
    profile: { type: ProfileSchema, default: () => ({}) },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

const Model = mongoose.model('user', Schema)

module.exports = {
  getUser: async user => {
    if (!user) throw new Error('User is required.')
    if (!user.id) throw new Error('User Id is required.')

    const cached = cache.get(user.id)
    if (cached) return cached

    let userDb = await Model.findById(user.id)
    if (!userDb) {
      // Create new user in database if they don't exist
      userDb = await Model.create({
        _id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        flags: [],
      })
    }

    cache.add(user.id, userDb)
    return userDb
  },

  addFlag: async (userId, reason, flaggedBy, serverId, serverName) => {
    const newFlag = {
      reason,
      flaggedBy,
      flaggedAt: new Date(),
      serverId,
      serverName,
    }

    const user = await Model.findByIdAndUpdate(
      userId,
      { $push: { flags: newFlag } },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },

  removeFlag: async (userId, flaggedBy) => {
    const user = await Model.findByIdAndUpdate(
      userId,
      { $pull: { flags: { flaggedBy } } },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },

  removeAllFlags: async userId => {
    const user = await Model.findByIdAndUpdate(
      userId,
      { $set: { flags: [] } },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },

  updatePremium: async (userId, enabled, expiresAt) => {
    const user = await Model.findByIdAndUpdate(
      userId,
      {
        $set: {
          'premium.enabled': enabled,
          'premium.expiresAt': expiresAt,
        },
      },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },
  setAfk: async (userId, reason = null, duration = null) => {
    const since = new Date()
    const endTime = duration
      ? new Date(since.getTime() + duration * 60000)
      : null

    const user = await Model.findByIdAndUpdate(
      userId,
      {
        $set: {
          'afk.enabled': true,
          'afk.reason': reason,
          'afk.since': since,
          'afk.endTime': endTime,
        },
      },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },

  removeAfk: async userId => {
    const user = await Model.findByIdAndUpdate(
      userId,
      {
        $set: {
          'afk.enabled': false,
          'afk.reason': null,
          'afk.since': null,
          'afk.endTime': null,
        },
      },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },

  updateProfile: async (userId, profileData) => {
    const user = await Model.findByIdAndUpdate(
      userId,
      { $set: { profile: profileData } },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },

  clearProfile: async userId => {
    const user = await Model.findByIdAndUpdate(
      userId,
      {
        $set: {
          profile: {
            pronouns: null,
            age: null,
            region: null,
            timezone: null,
            bio: null,
            birthdate: null,
            interests: [],
            customFields: [],
            privacy: {
              showAge: true,
              showRegion: true,
              showBirthdate: false,
            },
          },
        },
      },
      { new: true }
    )

    if (user) cache.add(userId, user)
    return user
  },
}
