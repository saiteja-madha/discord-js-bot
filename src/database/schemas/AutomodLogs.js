const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema(
  {
    guild_id: reqString,
    member_id: reqString,
    content: String,
    reason: String,
    strikes: Number,
  },
  {
    versionKey: false,
    autoIndex: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

const Model = mongoose.model("automod-logs", Schema);

module.exports = {
  addAutoModLogToDb: async (member, content, reason, strikes) => {
    if (!member) throw new Error("Member is undefined");
    await new Model({
      guild_id: member.guild.id,
      member_id: member.id,
      content,
      reason,
      strikes,
    }).save();
  },
};
