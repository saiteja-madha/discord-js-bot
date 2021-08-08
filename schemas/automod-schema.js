const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.json");
const Cache = require("@utils/cache");
const cache = new Cache(CACHE_SIZE);

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  automodlog_channel: String,
  anti_links: Boolean,
  anti_invites: Boolean,
  anti_ghostping: Boolean,
  max_mentions: Number,
  max_role_mentions: Number,
  max_lines: Number,
});

const Model = mongoose.model("automod", Schema);

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

  automodLogChannel: async (guildId, status) => {
    return await Model.updateOne(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        automodlog_channel: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  antiLinks: async (guildId, status) => {
    return await Model.findOneAndUpdate(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        anti_links: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  antiInvites: async (guildId, status) => {
    return await Model.findOneAndUpdate(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        anti_invites: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  antiGhostPing: async (guildId, status) => {
    return await Model.findOneAndUpdate(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        anti_ghostping: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  maxMentions: async (guildId, status) => {
    return await Model.findOneAndUpdate(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        max_mentions: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  maxRoleMentions: async (guildId, status) => {
    return await Model.findOneAndUpdate(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        max_role_mentions: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  maxLines: async (guildId, status) => {
    return await Model.findOneAndUpdate(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        max_lines: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },
};
