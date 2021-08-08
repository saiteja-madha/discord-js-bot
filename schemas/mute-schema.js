const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema(
  {
    guildId: reqString,
    userId: reqString,
    reason: reqString,
    adminId: reqString,
    adminTag: reqString,
    expires: {
      type: Date,
      required: false,
    },
    isPermanent: {
      type: Boolean,
      required: false,
    },
    current: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Model = mongoose.model("mutes", Schema);

module.exports = {
  addMuteToDb: async (guild, admin, target, reason, minutes) => {
    if (!minutes) {
      await new Model({
        guildId: guild.id,
        userId: target.id,
        reason,
        adminId: admin.id,
        adminTag: admin.tag,
        isPermanent: true,
        current: true,
      }).save();
    } else {
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + minutes);

      await new Model({
        guildId: guild.id,
        userId: target.id,
        reason,
        adminId: admin.id,
        adminTag: admin.tag,
        expires,
        current: true,
      }).save();
    }
  },

  unmute: async (guildId, targetId) => {
    return await Model.updateOne(
      {
        guildId,
        userId: targetId,
        current: true,
      },
      {
        current: false,
      }
    );
  },

  getMuteInfo: async (guild, targetId) => {
    return await Model.findOne({
      guildId: guild.id,
      userId: targetId,
      current: true,
    });
  },
};
