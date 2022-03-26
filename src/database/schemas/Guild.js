const mongoose = require("mongoose");
const { CACHE_SIZE, PREFIX } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS);

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  data: {
    name: String,
    region: String,
    owner: {
      id: String,
      tag: String,
    },
    joinedAt: Date,
    leftAt: Date,
    bots: {
      type: Number,
      default: 0,
    },
  },
  prefix: {
    type: String,
    default: PREFIX,
  },
  ranking: {
    enabled: Boolean,
  },
  ticket: {
    log_channel: String,
    limit: {
      type: Number,
      default: 10,
    },
  },
  automod: {
    debug: Boolean,
    strikes: {
      type: Number,
      default: 5,
    },
    action: {
      type: String,
      default: "MUTE",
    },
    anti_links: Boolean,
    anti_invites: Boolean,
    anti_scam: Boolean,
    anti_ghostping: Boolean,
    max_mentions: Number,
    max_role_mentions: Number,
    max_lines: Number,
  },
  invite: {
    tracking: Boolean,
    ranks: [
      {
        invites: {
          type: String,
          required: true,
        },
        _id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  flag_translation: {
    enabled: Boolean,
  },
  modlog_channel: String,
  max_warn: {
    action: {
      type: String,
      default: "BAN",
    },
    limit: {
      type: Number,
      default: 5,
    },
  },
  counters: [
    {
      _id: false,
      counter_type: String,
      name: String,
      channel_id: String,
    },
  ],
  welcome: {
    enabled: Boolean,
    channel: String,
    content: String,
    embed: {
      description: String,
      color: String,
      thumbnail: Boolean,
      footer: String,
    },
  },
  farewell: {
    enabled: Boolean,
    channel: String,
    content: String,
    embed: {
      description: String,
      color: String,
      thumbnail: Boolean,
      footer: String,
    },
  },
  autorole: String,
  suggestions: {
    enabled: Boolean,
    channel_id: String,
  },
});

const Model = mongoose.model("guild", Schema);

module.exports = {
  getSettings: async (guild) => {
    if (cache.contains(guild.id)) return cache.get(guild.id);

    let guildData = await Model.findOne({ _id: guild.id });
    if (!guildData) {
      await guild.fetchOwner({ cache: true });
      guildData = new Model({
        _id: guild.id,
        data: {
          name: guild.name,
          region: guild.preferredLocale,
          owner: {
            id: guild.ownerId,
            tag: guild.members.cache.get(guild.ownerId)?.user.tag,
          },
          joinedAt: guild.joinedAt,
        },
      });

      if (!guild.id) {
        throw new Error("Guild ID is undefined");
      }

      await guildData.save();
    }
    cache.add(guild.id, guildData);
    return guildData;
  },
};
