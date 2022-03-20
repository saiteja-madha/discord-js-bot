const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.USERS);

const ReqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  _id: ReqString,
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

module.exports = {
  getUser: async (userId) => {
    const cached = cache.get(userId);
    if (cached) return cached;

    let user = await Model.findById(userId);
    if (!user) user = new Model({ _id: userId });

    cache.add(userId, user);
    return user;
  },
};
