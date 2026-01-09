const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    isUsed: { type: Boolean, default: false },
    usedBy: String,
    usedAt: Date,
    duration: { type: Number, default: 30 }, // dias
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("vipkey", Schema);