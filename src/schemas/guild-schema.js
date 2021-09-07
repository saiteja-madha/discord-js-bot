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
    channels: [
      {
        type: String,
      },
    ],
  },
  modlog_channel: String,
});

const Model = mongoose.model("guild", Schema);

async function registerGuild(guild) {
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true });
  const guildData = await Model.findOneAndUpdate(
    { _id: guild.id },
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

    let guildData = await Model.findOne({ _id: guild.id }).lean({ defaults: true });
    if (guildData) {
      cache.add(guild.id, guildData);
      return guildData;
    }

    guildData = await registerGuild(guild);
    cache.add(guild.id, guildData);
    return guildData;
  },

  setPrefix: async (_id, prefix) => {
    await Model.updateOne({ _id }, { prefix }).then(cache.remove(_id));
  },

  xpSystem: async (_id, status) => {
    await Model.updateOne({ _id }, { "ranking.enabled": status }).then(cache.remove(_id));
  },

  setTicketLogChannel: async (_id, channelId) => {
    await Model.updateOne({ _id }, { "ticket.log_channel": channelId }).then(cache.remove(_id));
  },

  setTicketLimit: async (_id, limit) => {
    await Model.updateOne({ _id }, { "ticket.limit": limit }).then(cache.remove(_id));
  },

  maxStrikes: async (_id, strikes) => Model.updateOne({ _id }, { "automod.strikes": strikes }).then(cache.remove(_id)),

  automodAction: async (_id, action) => Model.updateOne({ _id }, { "automod.action": action }).then(cache.remove(_id)),

  automodDebug: async (_id, status) => Model.updateOne({ _id }, { "automod.debug": status }).then(cache.remove(_id)),

  antiLinks: async (_id, status) => Model.updateOne({ _id }, { "automod.anti_links": status }).then(cache.remove(_id)),

  antiScam: async (_id, status) => Model.updateOne({ _id }, { "automod.anti_scam": status }).then(cache.remove(_id)),

  antiInvites: async (_id, status) =>
    Model.updateOne({ _id }, { "automod.anti_invites": status }).then(cache.remove(_id)),

  antiGhostPing: async (_id, status) =>
    Model.updateOne({ _id }, { "automod.anti_ghostping": status }).then(cache.remove(_id)),

  maxMentions: async (_id, amount) =>
    Model.updateOne({ _id }, { "automod.max_mentions": amount }).then(cache.remove(_id)),

  maxRoleMentions: async (_id, amount) =>
    Model.updateOne({ _id }, { "automod.max_role_mentions": amount }).then(cache.remove(_id)),

  maxLines: async (_id, amount) => Model.updateOne({ _id }, { "automod.max_lines": amount }).then(cache.remove(_id)),

  inviteTracking: async (_id, status) => {
    Model.updateOne({ _id }, { $set: { "invite.tracking": status } }).then(cache.remove(_id));
  },

  addInviteRank: async (_id, roleId, invites) =>
    Model.updateOne(
      { _id },
      {
        $push: {
          "invite.ranks": {
            _id: roleId,
            invites,
          },
        },
      }
    ).then(cache.remove(_id)),

  removeInviteRank: async (_id, roleId) =>
    Model.updateOne({ _id }, { $pull: { "invite.ranks": { _id: roleId } } }).then(cache.remove(_id)),

  registerGuild,

  updateGuildLeft: async (guild) => {
    await Model.updateOne({ _id: guild.id }, { "data.leftAt": new Date() }).then(cache.remove(guild.id));
  },

  flagTranslation: async (_id, status) => {
    await Model.updateOne({ _id }, { $set: { "flag_translation.enabled": status } }).then(cache.remove(_id));
  },

  setFlagTrChannels: async (_id, channels) => {
    await Model.updateOne({ _id }, { "flag_translation.channels": channels }).then(cache.remove(_id));
  },

  modLogChannel: async (_id, channelId) =>
    Model.updateOne({ _id }, { modlog_channel: channelId }).then(cache.remove(_id)),
};
