const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const { FixedSizeCache } = require("@src/structures");

const cache = new FixedSizeCache(CACHE_SIZE.GUILDS);

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

  getCounterGuilds: async () => Model.find().select("_id").lean({ defaults: true }),

  setTotalCountChannel: async (guildId, channelId, name) => {
    await Model.updateOne(
      { _id: guildId },
      {
        tc_channel: channelId,
        tc_name: name,
      },
      { upsert: true }
    );

    if (cache.contains(guildId)) {
      const config = cache.get(guildId);
      config.tc_channel = channelId;
      config.tc_name = name;
    }
  },

  setMemberCountChannel: async (guildId, channelId, name) => {
    await Model.updateOne(
      { _id: guildId },
      {
        mc_channel: channelId,
        mc_name: name,
      },
      { upsert: true }
    );

    if (cache.contains(guildId)) {
      const config = cache.get(guildId);
      config.mc_channel = channelId;
      config.mc_name = name;
    }
  },

  setBotCountChannel: async (guildId, channelId, name) => {
    await Model.updateOne(
      { _id: guildId },
      {
        bc_channel: channelId,
        bc_name: name,
      },
      { upsert: true }
    );

    if (cache.contains(guildId)) {
      const config = cache.get(guildId);
      config.bc_channel = channelId;
      config.bc_name = name;
    }
  },

  updateBotCount: async (guildId, count, isIncrement = false) => {
    // Increment Count
    if (isIncrement) {
      await Model.updateOne({ _id: guildId }, { $inc: { bot_count: count } }, { upsert: true });
      if (cache.contains(guildId)) {
        cache.get(guildId).bot_count += count;
      }
    }
    // Update Count
    else {
      await Model.updateOne({ _id: guildId }, { bot_count: count }, { upsert: true });
      if (cache.contains(guildId)) {
        cache.get(guildId).bot_count = count;
      }
    }
  },
};
