const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: reqString,
  member_id: reqString,
  coins: {
    type: Number,
    default: 0,
  },
  daily_streak: Number,
  daily_timestamp: Date,
});

const Model = mongoose.model("economy", Schema);

module.exports = {
  getConfig: async (guildId, memberId) => {
    return await Model.findOne({
      guild_id: guildId,
      member_id: memberId,
    });
  },

  addCoins: async (guildId, memberId, coins) => {
    return await Model.findOneAndUpdate(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        $inc: {
          coins,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  },

  updateDailyStreak: async (guildId, memberId, coins, streak) => {
    return await Model.findOneAndUpdate(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        daily_streak: streak,
        daily_timestamp: new Date(),
        $inc: {
          coins,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  },
};
