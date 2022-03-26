const mongoose = require("mongoose");

const Schema = mongoose.Schema(
  {
    guild_id: String,
    user_id: String,
    message_id: String,
    suggestion: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    stats: {
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
    },
    status_updates: [
      {
        user_id: String,
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED"],
        },
        timestamp: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Model = mongoose.model("suggestions", Schema);

module.exports = {
  model: Model,

  addSuggestion: async (message, userId, suggestion) => {
    return new Model({
      guild_id: message.guildId,
      message_id: message.id,
      user_id: userId,
      suggestion: suggestion,
    }).save();
  },

  findSuggestion: async (guildId, messageId) => {
    return Model.findOne({ guild_id: guildId, message_id: messageId });
  },
};
