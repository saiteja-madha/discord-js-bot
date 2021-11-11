const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.MEMBERS);

const ReqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: ReqString,
  member_id: ReqString,
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
  invite_data: {
    inviter: String,
    code: String,
    tracked: { type: Number, default: 0 },
    fake: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    added: { type: Number, default: 0 },
  },
  mute: {
    active: Boolean,
  },
});

const Model = mongoose.model("members", Schema);

module.exports = {
  getMember: async (guildId, memberId) => {
    const key = `${guildId}|${memberId}`;
    if (cache.contains(key)) return cache.get(key);

    let guildData = await Model.findOne({ guild_id: guildId, member_id: memberId });
    if (!guildData) {
      guildData = new Model({
        guild_id: guildId,
        member_id: memberId,
      });
    }

    cache.add(key, guildData);
    return guildData;
  },

  getTop100: async (guildId) =>
    Model.find({
      guild_id: guildId,
    })
      .limit(100)
      .sort({ level: -1, xp: -1 })
      .lean({ defaults: true }),
};
