const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema(
  {
    guild_id: reqString,
    channel_id: reqString,
    message_id: reqString,
    emoji: reqString,
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

const Model = mongoose.model("logs-translation", Schema);

module.exports = {
  model: Model,

  isTranslated: async (message, code) =>
    Model.findOne({
      guild_id: message.guildId,
      channel_id: message.channelId,
      message_id: message.id,
      emoji: code,
    }).lean(),

  logTranslation: async (message, code) =>
    new Model({
      guild_id: message.guildId,
      channel_id: message.channelId,
      message_id: message.id,
      emoji: code,
    }).save(),
};
