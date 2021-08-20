const mongoose = require("mongoose");
const leanDefaults = require("mongoose-lean-defaults").default;
const { CACHE_SIZE, PREFIX } = require("@root/config.js");
const Cache = require("@utils/cache");
const cache = new Cache(CACHE_SIZE);

const Schema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: PREFIX,
  },
  ranking_enabled: Boolean,
  ticket: {
    log_channel: String,
    limit: {
      type: Number,
      default: 10,
    },
  },
  automod: {
    log_channel: String,
    anti_links: Boolean,
    anti_invites: Boolean,
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
        role_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

Schema.plugin(leanDefaults);
const Model = mongoose.model("settings", Schema);

module.exports = {
  getSettings: async (guildId) => {
    if (!cache.contains(guildId)) {
      cache.add(
        guildId,
        await Model.findOne({
          _id: guildId,
        }).lean({ defaults: true })
      );
    }
    return cache.get(guildId);
  },

  setPrefix: async (guildId, prefix) => {
    await Model.updateOne({ _id: guildId }, { prefix }, { upsert: true }).then(cache.remove(guildId));
  },

  xpSystem: async (guildId, status) => {
    await Model.updateOne({ _id: guildId }, { ranking_enabled: status }, { upsert: true }).then(cache.remove(guildId));
  },

  setTicketLogChannel: async (guildId, channelId) => {
    const data = await Model.updateOne(
      { _id: guildId },
      {
        $set: { "ticket.log_channel": channelId },
      },
      { upsert: true }
    ).then(cache.remove(guildId));

    return data;
  },

  setTicketLimit: async (guildId, limit) => {
    const data = await Model.updateOne(
      { _id: guildId },
      {
        $set: { "ticket.limit": limit },
      },
      { upsert: true }
    ).then(cache.remove(guildId));

    return data;
  },

  automodLogChannel: async (guildId, channelId) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.log_channel": channelId },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  antiLinks: async (guildId, status) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.anti_links": status },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  antiInvites: async (guildId, status) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.anti_invites": status },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  antiGhostPing: async (guildId, status) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.anti_ghostping": status },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  maxMentions: async (guildId, amount) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.max_mentions": amount },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  maxRoleMentions: async (guildId, amount) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.max_role_mentions": amount },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  maxLines: async (guildId, amount) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $set: { "automod.max_lines": amount },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  inviteTracking: async (guildId, status) => {
    await Model.updateOne(
      { _id: guildId },
      {
        $set: { "invite.tracking": status },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  addInviteRank: async (guildId, roleId, invites) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $push: {
          "invites.ranks": {
            role_id: roleId,
            invites: invites,
          },
        },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },

  removeInviteRank: async (guildId, roleId) => {
    return await Model.updateOne(
      { _id: guildId },
      {
        $pull: {
          "invites.ranks": { role_id: roleId },
        },
      },
      { upsert: true }
    ).then(cache.remove(guildId));
  },
};
