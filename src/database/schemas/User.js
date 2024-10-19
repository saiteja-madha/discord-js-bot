const mongoose = require('mongoose')
const { CACHE_SIZE } = require('@root/config.js')
const FixedSizeMap = require('fixedsize-map')

const cache = new FixedSizeMap(CACHE_SIZE.USERS)

const FlagSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  flaggedBy: { type: String, required: true },
  flaggedAt: { type: Date, default: Date.now },
  serverId: { type: String, required: true },
  serverName: { type: String, required: true },
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
}
