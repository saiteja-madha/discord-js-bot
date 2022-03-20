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

    let member = await Model.findOne({ guild_id: guildId, member_id: memberId });
    if (!member) {
      member = new Model({
        guild_id: guildId,
        member_id: memberId,
      });
    }

    cache.add(key, member);
    return member;
  },

  getXpLb: async (guildId, limit = 10) =>
    Model.find({
      guild_id: guildId,
    })
      .limit(limit)
      .sort({ level: -1, xp: -1 })
      .lean(),

  getInvitesLb: async (guildId, limit = 10) =>
    Model.aggregate([
      { $match: { guild_id: guildId } },
      {
        $project: {
          member_id: "$member_id",
          invites: {
            $subtract: [
              { $add: ["$invite_data.tracked", "$invite_data.added"] },
              { $add: ["$invite_data.left", "$invite_data.fake"] },
            ],
          },
        },
      },
      { $match: { invites: { $gt: 0 } } },
      { $sort: { invites: -1 } },
      { $limit: limit },
    ]),
};
