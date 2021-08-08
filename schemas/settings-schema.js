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

  inviteTracking: async (guildId, status) => {
    await Model.updateOne(
      {
        _id: guildId,
      },
      {
        _id: guildId,
        invite_tracking: status,
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));
  },

  addInviteRank: async (guildId, roleId, invites) => {
    const data = await Model.updateOne(
      {
        _id: guildId,
      },
      {
        $push: {
          invite_ranks: {
            role_id: roleId,
            invites: invites,
          },
        },
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));

    return data;
  },

  removeInviteRank: async (guildId, roleId) => {
    const data = await Model.updateOne(
      {
        _id: guildId,
      },
      {
        $pull: {
          invite_ranks: {
            role_id: roleId,
          },
        },
      },
      {
        upsert: true,
      }
    ).then(cache.remove(guildId));

    return data;
  },
};
