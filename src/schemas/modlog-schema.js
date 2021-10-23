const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema(
  {
    guild_id: reqString,
    member_id: String,
    reason: String,
    admin: {
      id: reqString,
      tag: reqString,
    },
    type: reqString,
    data: {
      expires: {
        type: Date,
        required: false,
      },
      isPermanent: {
        type: Boolean,
        required: false,
      },
      active: {
        type: Boolean,
        required: false,
      },
    },
  },
  { timestamps: true }
);

const Model = mongoose.model("mod-logs", Schema);

module.exports = {
  addModLogToDb: async (admin, target, reason, type, data) => {
    const toSave = {
      guild_id: admin.guild.id,
      member_id: target.id,
      reason,
      admin: {
        id: admin.id,
        tag: admin.user.tag,
      },
      type,
      data: {
        active: true,
      },
    };

    if (type === "MUTE") {
      if (data.expires) {
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + data.minutes);
        toSave.data.expires = expires;
      } else {
        toSave.data.isPermanent = true;
      }
    }

    await new Model(toSave).save();
  },

  getMuteInfo: async (guildId, targetId) =>
    Model.findOne({
      guild_id: guildId,
      member_id: targetId,
      type: "MUTE",
      "data.active": true,
    }).lean({ defaults: true }),

  removeMutes: async (guildId, targetId) =>
    Model.updateMany(
      {
        guild_id: guildId,
        member_id: targetId,
        type: "MUTE",
        "data.active": true,
      },
      { "data.active": false }
    ),

  getWarnings: async (guildId, targetId) =>
    Model.find({
      guild_id: guildId,
      member_id: targetId,
      type: "WARN",
      "data.active": true,
    }).lean({ defaults: true }),

  clearWarnings: async (guildId, targetId) =>
    Model.updateMany(
      {
        guild_id: guildId,
        member_id: targetId,
        type: "WARN",
        "data.active": true,
      },
      {
        "data.active": false,
      }
    ),
};
