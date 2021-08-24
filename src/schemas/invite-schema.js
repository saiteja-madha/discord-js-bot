const mongoose = require("mongoose");

const ReqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: ReqString,
  member_id: ReqString,
  inviter_id: String,
  invite_code: String,
  tracked_invites: {
    type: Number,
    default: 0,
  },
  fake_invites: {
    type: Number,
    default: 0,
  },
  left_invites: {
    type: Number,
    default: 0,
  },
  added_invites: {
    type: Number,
    default: 0,
  },
});

const Model = mongoose.model("invites", Schema);

module.exports = {
  getDetails: async (guildId, memberId) => {
    return await Model.findOne(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {},
      { upsert: true }
    ).lean();
  },

  addInviter: async (guildId, memberId, inviterId, inviteCode) => {
    return await Model.updateOne(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      {
        inviter_id: inviterId,
        invite_code: inviteCode,
      },
      { upsert: true }
    );
  },

  /**
   * @param {"TRACKED"|"LEFT"|"FAKE"|"ADDED"} type
   */
  incrementInvites: async (guildId, memberId, type, amount) => {
    const filter = { guild_id: guildId, member_id: memberId };
    const options = { upsert: true, new: true };

    switch (type) {
      case "TRACKED":
        return await Model.findOneAndUpdate(filter, { $inc: { tracked_invites: amount || 1 } }, options).lean();

      case "LEFT":
        return await Model.findOneAndUpdate(filter, { $inc: { left_invites: amount || 1 } }, options).lean();

      case "FAKE":
        return await Model.findOneAndUpdate(filter, { $inc: { fake_invites: amount || 1 } }, options).lean();

      case "ADDED":
        return await Model.findOneAndUpdate(filter, { $inc: { added_invites: amount || 1 } }, options).lean();
    }
  },

  clearInvites: async (guildId, memberId) => {
    return await Model.updateOne(
      {
        guild_id: guildId,
        member_id: memberId,
      },
      { added_invites: 0 },
      { upsert: true }
    );
  },
};
