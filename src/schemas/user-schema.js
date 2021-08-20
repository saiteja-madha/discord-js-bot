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

// Schema.plugin(leanDefaults);
const Model = mongoose.model("user", Schema);

const upsert = { upsert: true };
const upsertNew = { upsert: true, new: true };

module.exports = {
  getUser: async (id) => {
    return await Model.findOne({ id }).lean({ defaults: true });
  },

  loggedIn: async (id, status) => {
    return await Model.updateOne({ id }, { logged: status }, upsert);
  },

  increaseReputation: async (id, targetId) => {
    await Model.updateOne(
      { id },
      { $inc: { "reputation.given": 1 }, $set: { "reputation.timestamp": new Date() } },
      upsert
    );
    await Model.updateOne({ id: targetId }, { $inc: { "reputation.received": 1 } }, upsert);
  },

  addCoins: async (id, coins) => {
    return await Model.findOneAndUpdate({ id }, { $inc: { coins } }, upsertNew);
  },

  updateDailyStreak: async (id, coins, streak) => {
    return await Model.findOneAndUpdate(
      { id },
      {
        $set: {
          "daily.streak": streak,
          "daily.timestamp": new Date(),
        },
        $inc: { coins },
      },
      upsertNew
    );
  },
};
