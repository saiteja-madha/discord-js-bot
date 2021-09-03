const mongoose = require("mongoose");

const ReqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  id: ReqString,
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
  getUser: async (id) => Model.findOne({ id }).lean({ defaults: true }),

  loggedIn: async (id, status) => Model.updateOne({ id }, { logged: status }, upsert),

  increaseReputation: async (id, targetId) => {
    await Model.updateOne(
      { id },
      { $inc: { "reputation.given": 1 }, $set: { "reputation.timestamp": new Date() } },
      upsert
    );
    await Model.updateOne({ id: targetId }, { $inc: { "reputation.received": 1 } }, upsert);
  },

  addCoins: async (id, coins) => Model.findOneAndUpdate({ id }, { $inc: { coins } }, upsertNew),

  depositCoins: async (id, coins) => {
    return await Model.findOneAndUpdate(
      { id },
      {
        $inc: {
          coins: -coins,
          bank: coins,
        },
      },
      upsertNew
    );
  },

  updateDailyStreak: async (id, coins, streak) =>
    Model.findOneAndUpdate(
      { id },
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
