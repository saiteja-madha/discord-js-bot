const mongoose = require("mongoose");

const ReqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: ReqString,
  member_id: ReqString,
  messages: {
    type: Number,
    default: 0,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  strikes: {
    type: Number,
    default: 0,
  },
  warnings: {
    type: Number,
    default: 0,
  },
});

const Model = mongoose.model("profile", Schema);

module.exports = {
  getProfile: async (guildId, memberId) =>
    Model.findOne({
      guild_id: guildId,
      member_id: memberId,
    }).lean({ defaults: true }),

  getTop100: async (guildId) =>
    Model.find({
      guild_id: guildId,
    })
      .limit(100)
      .sort({ level: -1, xp: -1 })
      .lean({ defaults: true }),

  incrementXP: async (guildId, memberId, xp) =>
    Model.findOneAndUpdate(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        $inc: {
          xp,
          messages: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    ).lean({ defaults: true }),

  incrementMessages: async (guildId, memberId) =>
    Model.updateOne(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        $inc: { messages: 1 },
      },
      { upsert: true }
    ),

  setLevel: async (guildId, memberId, level, xp) =>
    Model.updateOne(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        level,
        xp,
      }
    ),

  addStrikes: async (guildId, memberId, strikes) =>
    Model.findOneAndUpdate(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      { $inc: { strikes } },
      {
        upsert: true,
        new: true,
      }
    ).lean({ defaults: true }),

  addWarnings: async (guildId, memberId, warnings) =>
    Model.findOneAndUpdate(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      { $inc: { warnings } },
      {
        upsert: true,
        new: true,
      }
    ).lean({ defaults: true }),
};
