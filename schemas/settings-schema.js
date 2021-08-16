const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.json");
const Cache = require("@utils/cache");
const cache = new Cache(CACHE_SIZE);

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  prefix: String,
  ranking_enabled: Boolean,
  ticket: {
    log_channel: String,
    limit: {
      type: Number,
      default: 10,
    },
  },
});

const Model = mongoose.model("settings", Schema);

module.exports = {
  getSettings: async (guildId) => {
    if (!cache.contains(guildId)) {
      cache.add(
        guildId,
        await Model.findOne({
          _id: guildId,
        })
      );
    }
    return cache.get(guildId);
  },

  setPrefix: async (guildId, prefix) => {
    await Model.updateOne(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        prefix,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  xpSystem: async (guildId, status) => {
    await Model.updateOne(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        ranking_enabled: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  setTicketLogChannel: async (guildId, channelId) => {
    const data = await Model.updateOne(
      {
        _id: guildId,
      },
      {
        $set: {
          "ticket.log_channel": channelId,
        },
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));

    return data;
  },

  setTicketLimit: async (guildId, limit) => {
    const data = await Model.updateOne(
      {
        _id: guildId,
      },
      {
        $set: {
          "ticket.limit": limit,
        },
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));

    return data;
  },
};
