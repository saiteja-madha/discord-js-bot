const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: String,
  region: String,
  ownerId: String,
  owner: String,
  join_timestamp: Date,
  left_timestamp: Date,
});

const Model = mongoose.model("guild-data", Schema);

module.exports = {
  registerGuild: async (guild) => {
    await Model.updateOne(
      {
        _id: guild.id,
      },
      {
        _id: guild.id,
        name: guild.name,
        region: guild.region,
        ownerId: guild.ownerId,
        owner: guild.owner?.user?.tag,
        join_timestamp: guild.joinedAt,
      },
      {
        upsert: true,
      }
    );
  },

  updateGuildLeft: async (guild) => {
    await Model.updateOne(
      {
        _id: guild.id,
      },
      {
        _id: guild.id,
        name: guild.name,
        region: guild.region,
        ownerId: guild.ownerId,
        owner: guild.owner?.user?.tag,
        left_timestamp: new Date(),
      },
      {
        upsert: true,
      }
    );
  },
};
