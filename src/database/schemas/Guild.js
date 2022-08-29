const mongoose = require("mongoose");
const { CACHE_SIZE, PREFIX, STATS } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");
const { getUser } = require("./User");

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS);

const Schema = new mongoose.Schema({
  _id: String,
  data: {
    name: String,
    region: String,
    owner: { type: String, ref: "users" },
    joinedAt: Date,
    leftAt: Date,
    bots: { type: Number, default: 0 },
  },
  prefix: { type: String, default: PREFIX },
  stats: {
    enabled: Boolean,
    xp: {
      message: { type: String, default: STATS.DEFAULT_LVL_UP_MSG },
      channel: String,
    },
  },
  ticket: {
    log_channel: String,
    limit: { type: Number, default: 10 },
    categories: [
      {
        _id: false,
        name: String,
        staff_roles: [String],
      },
    ],
  },
  automod: {
    debug: Boolean,
    strikes: { type: Number, default: 10 },
    action: { type: String, default: "TIMEOUT" },
    wh_channels: [String],
    anti_attachments: Boolean,
    anti_invites: Boolean,
    anti_links: Boolean,
    anti_spam: Boolean,
    anti_ghostping: Boolean,
    anti_massmention: Number,
    max_lines: Number,
  },
  invite: {
    tracking: Boolean,
    ranks: [
      {
        invites: { type: Number, required: true },
        _id: { type: String, required: true },
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
      enum: ["TIMEOUT", "KICK", "BAN"],
      default: "KICK",
    },
    limit: { type: Number, default: 5 },
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
      image: String,
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
      image: String,
    },
  },
  autorole: String,
  suggestions: {
    enabled: Boolean,
    channel_id: String,
    approved_channel: String,
    rejected_channel: String,
    staff_roles: [String],
  },
});

const Model = mongoose.model("guild", Schema);

module.exports = {
  /**
   * @param {import('discord.js').Guild} guild
   */
  getSettings: async (guild) => {
    if (!guild) throw new Error("Guild is undefined");
    if (!guild.id) throw new Error("Guild Id is undefined");

    const cached = cache.get(guild.id);
    if (cached) return cached;

    let guildData = await Model.findById(guild.id);
    if (!guildData) {
      // save owner details
      guild
        .fetchOwner()
        .then(async (owner) => {
          const userDb = await getUser(owner);
          await userDb.save();
        })
        .catch((ex) => {});

      // create a new guild model
      guildData = new Model({
        _id: guild.id,
        data: {
          name: guild.name,
          region: guild.preferredLocale,
          owner: guild.ownerId,
          joinedAt: guild.joinedAt,
        },
      });

      await guildData.save();
    }
    cache.add(guild.id, guildData);
    return guildData;
  },
};
