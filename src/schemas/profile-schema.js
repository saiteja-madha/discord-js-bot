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
});

const Model = mongoose.model("profile", Schema);

module.exports = {
  incrementXP: async (guildId, memberId, xp) => {
    return await Model.findOneAndUpdate(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        guild_id: guildId,
        member_id: memberId,
        $inc: {
          xp,
          messages: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  },

  setLevel: async (guildId, memberId, level, xp) => {
    return await Model.updateOne(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        level,
        xp,
      }
    );
  },
};
