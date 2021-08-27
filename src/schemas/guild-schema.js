const mongoose = require("mongoose");
const { CACHE_SIZE, PREFIX } = require("@root/config.js");
const { FixedSizeCache } = require("@src/structures");
const cache = new FixedSizeCache(CACHE_SIZE.GUILDS);

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
        _id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  flag_translation: {
    enabled: Boolean,
    channels: [
      {
        type: String,
      },
    ],
  },
});

const Model = mongoose.model("guild", Schema);

async function registerGuild(guild) {
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true });
  let guildData = await Model.findOneAndUpdate(
    {
      _id: guild.id,
    },
    {
      "data.name": guild.name,
      "data.region": guild.preferredLocale,
      "data.owner.id": guild.ownerId,
      "data.owner.tag": guild.members.cache.get(guild.ownerId).user.tag,
      "data.joinedAt": guild.joinedAt,
    },
    { upsert: true, new: true }
  ).lean({ defaults: true });
  return guildData;
}

module.exports = {
  getSettings: async (guild) => {
    if (!guild) return;
    if (cache.contains(guild.id)) return cache.get(guild.id);
    else {
      let guildData = await Model.findOne({ _id: guild.id }).lean({ defaults: true });
      if (guildData) {
        cache.add(guild.id, guildData);
        return guildData;
      } else {
        let guildData = await registerGuild(guild);
        cache.add(guild.id, guildData);
        return guildData;
      }
    }
  },

  setPrefix: async (id, prefix) => {
    await Model.updateOne({ _id: id }, { prefix }).then(cache.remove(id));
  },

  xpSystem: async (id, status) => {
    await Model.updateOne({ _id: id }, { "ranking.enabled": status }).then(cache.remove(id));
  },

  setTicketLogChannel: async (id, channelId) => {
    await Model.updateOne({ _id: id }, { "ticket.log_channel": channelId }).then(cache.remove(id));
  },

  setTicketLimit: async (id, limit) => {
    await Model.updateOne({ _id: id }, { "ticket.limit": limit }).then(cache.remove(id));
  },

  automodLogChannel: async (id, channelId) => {
    return await Model.updateOne({ _id: id }, { "automod.log_channel": channelId }).then(cache.remove(id));
  },

  antiLinks: async (id, status) => {
    return await Model.updateOne({ _id: id }, { "automod.anti_links": status }).then(cache.remove(id));
  },

  antiInvites: async (id, status) => {
    return await Model.updateOne({ _id: id }, { "automod.anti_invites": status }).then(cache.remove(id));
  },

  antiGhostPing: async (id, status) => {
    return await Model.updateOne({ _id: id }, { "automod.anti_ghostping": status }).then(cache.remove(id));
  },

  maxMentions: async (id, amount) => {
    return await Model.updateOne({ _id: id }, { "automod.max_mentions": amount }).then(cache.remove(id));
  },

  maxRoleMentions: async (id, amount) => {
    return await Model.updateOne({ _id: id }, { "automod.max_role_mentions": amount }).then(cache.remove(id));
  },

  maxLines: async (id, amount) => {
    return await Model.updateOne({ _id: id }, { "automod.max_lines": amount }).then(cache.remove(id));
  },

  inviteTracking: async (id, status) => {
    await Model.updateOne({ _id: id }, { $set: { "invite.tracking": status } }).then(cache.remove(id));
  },

  addInviteRank: async (id, roleId, invites) => {
    return await Model.updateOne(
      { _id: id },
      {
        $push: {
          "invite.ranks": {
            _id: roleId,
            invites: invites,
          },
        },
      }
    ).then(cache.remove(id));
  },

  removeInviteRank: async (id, roleId) => {
    return await Model.updateOne({ _id: id }, { $pull: { "invite.ranks": { _id: roleId } } }).then(cache.remove(id));
  },

  registerGuild,

  updateGuildLeft: async (guild) => {
    await Model.updateOne({ _id: guild.id }, { "data.leftAt": new Date() });
  },

  flagTranslation: async (id, status) => {
    await Model.updateOne({ _id: id }, { $set: { "flag_translation.enabled": status } }).then(cache.remove(id));
  },

  setFlagTrChannels: async (id, channels) => {
    await Model.updateOne({ _id: id }, { "flag_translation.channels": channels }).then(cache.remove(id));
  },
};
