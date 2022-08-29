const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.MEMBERS);

const ReqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema(
  {
    guild_id: ReqString,
    member_id: ReqString,
    strikes: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    invite_data: {
      inviter: String,
      code: String,
      tracked: { type: Number, default: 0 },
      fake: { type: Number, default: 0 },
      left: { type: Number, default: 0 },
      added: { type: Number, default: 0 },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

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
