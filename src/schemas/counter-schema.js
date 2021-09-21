const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS);

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  tc_channel: String,
  tc_name: String,
  mc_channel: String,
  mc_name: String,
  bc_channel: String,
  bc_name: String,
  bot_count: {
    type: Number,
    default: 0,
  },
});

const Model = mongoose.model("counter-config", Schema);

module.exports = {
  getConfig: async (guildId) => {
    if (cache.contains(guildId)) return cache.get(guildId);
    const config = await Model.findOne({ _id: guildId }).lean({ defaults: true });
    cache.add(guildId, config);
    return config;
  },

  setTotalCountChannel: async (guildId, channelId, name) =>
    Model.updateOne(
      { _id: guildId },
      {
        _id: guildId,
        tc_channel: channelId,
        tc_name: name,
      },
      { upsert: true }
    ).then(cache.remove(guildId)),

  setMemberCountChannel: async (guildId, channelId, name) =>
    Model.updateOne(
      { _id: guildId },
      {
        _id: guildId,
        mc_channel: channelId,
        mc_name: name,
      },
      { upsert: true }
    ).then(cache.remove(guildId)),

  setBotCountChannel: async (guildId, channelId, name) =>
    Model.updateOne(
      { _id: guildId },
      {
        _id: guildId,
        bc_channel: channelId,
        bc_name: name,
      },
      { upsert: true }
    ).then(cache.remove(guildId)),

  updateBotCount: async (guildId, count, isIncrement = false) => {
    if (isIncrement) {
      return Model.updateOne(
        { _id: guildId },
        {
          _id: guildId,
          $inc: { bot_count: count },
        },
        { upsert: true }
      ).then(cache.remove(guildId));
    }
    return Model.updateOne({ _id: guildId }, { _id: guildId, bot_count: count }, { upsert: true }).then(
      cache.remove(guildId)
    );
  },

  getCounterGuilds: async () => Model.find().select("_id").lean({ defaults: true }),
};
