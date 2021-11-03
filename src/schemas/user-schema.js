const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  logged: Boolean,
  coins: {
    type: Number,
    default: 0,
  },
  bank: {
    type: Number,
    default: 0,
  },
  reputation: {
    received: {
      type: Number,
      default: 0,
    },
    given: {
      type: Number,
      default: 0,
    },
    timestamp: Date,
  },
  daily: {
    streak: {
      type: Number,
      default: 0,
    },
    timestamp: Date,
  },
});

const Model = mongoose.model("user", Schema);

const upsert = { upsert: true };
const upsertNew = { upsert: true, new: true };

module.exports = {
  getUser: async (_id) => Model.findOne({ _id }).lean({ defaults: true }),

  loggedIn: async (_id, status) => Model.updateOne({ _id }, { logged: status }, upsert),

  increaseReputation: async (_id, targetId) => {
    await Model.updateOne(
      { _id },
      { $inc: { "reputation.given": 1 }, $set: { "reputation.timestamp": new Date() } },
      upsert
    );
    await Model.updateOne({ _id: targetId }, { $inc: { "reputation.received": 1 } }, upsert);
  },

  addCoins: async (_id, coins) => Model.findOneAndUpdate({ _id }, { $inc: { coins } }, upsertNew),

  depositCoins: async (_id, coins) => {
    return await Model.findOneAndUpdate(
      { _id },
      {
        $inc: {
          coins: -coins,
          bank: coins,
        },
      },
      upsertNew
    );
  },

  updateDailyStreak: async (_id, coins, streak) =>
    Model.findOneAndUpdate(
      { _id },
      {
        $set: {
          "daily.streak": streak,
          "daily.timestamp": new Date(),
        },
        $inc: { coins },
      },
      upsertNew
    ),
};
