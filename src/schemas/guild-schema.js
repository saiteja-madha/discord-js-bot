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
  max_warnings: {
    type: Number,
    default: 5,
  },
  max_warn_action: {
    type: String,
    default: "BAN",
  },
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

  registerGuild,

  updateGuildLeft: async (guild) =>
    Model.updateOne({ _id: guild.id }, { "data.leftAt": new Date() }).then(cache.remove(guild.id)),

  setPrefix: async (_id, prefix) => {
    await Model.updateOne({ _id }, { prefix });
    if (cache.contains(_id)) {
      cache.get(_id).prefix = prefix;
    }
  },

  xpSystem: async (_id, status) => {
    await Model.updateOne({ _id }, { "ranking.enabled": status });
    if (cache.contains(_id)) {
      cache.get(_id).ranking.enabled = status;
    }
  },

  setTicketLogChannel: async (_id, channelId) => {
    await Model.updateOne({ _id }, { "ticket.log_channel": channelId });
    if (cache.contains(_id)) {
      cache.get(_id).ticket.log_channel = channelId;
    }
  },

  setTicketLimit: async (_id, limit) => {
    await Model.updateOne({ _id }, { "ticket.limit": limit });
    if (cache.contains(_id)) {
      cache.get(_id).ticket.limit = limit;
    }
  },

  maxStrikes: async (_id, strikes) => {
    await Model.updateOne({ _id }, { "automod.strikes": strikes });
    if (cache.contains(_id)) {
      cache.get(_id).automod.strikes = strikes;
    }
  },

  automodAction: async (_id, action) => {
    await Model.updateOne({ _id }, { "automod.action": action });
    if (cache.contains(_id)) {
      cache.get(_id).automod.action = action;
    }
  },

  automodDebug: async (_id, status) => {
    await Model.updateOne({ _id }, { "automod.debug": status });
    if (cache.contains(_id)) {
      cache.get(_id).automod.debug = status;
    }
  },

  antiLinks: async (_id, status) => {
    await Model.updateOne({ _id }, { "automod.anti_links": status });
    if (cache.contains(_id)) {
      cache.get(_id).automod.anti_links = status;
    }
  },

  antiScam: async (_id, status) => {
    await Model.updateOne({ _id }, { "automod.anti_scam": status });
    if (cache.contains(_id)) {
      cache.get(_id).automod.anti_scam = status;
    }
  },

  antiInvites: async (_id, status) => {
    await Model.updateOne({ _id }, { "automod.anti_invites": status });
    if (cache.contains(_id)) {
      cache.get(_id).automod.anti_invites = status;
    }
  },

  antiGhostPing: async (_id, status) => {
    await Model.updateOne({ _id }, { "automod.anti_ghostping": status });
    if (cache.contains(_id)) {
      cache.get(_id).automod.anti_ghostping = status;
    }
  },

  maxMentions: async (_id, amount) => {
    await Model.updateOne({ _id }, { "automod.max_mentions": amount });
    if (cache.contains(_id)) {
      cache.get(_id).automod.max_mentions = amount;
    }
  },

  maxRoleMentions: async (_id, amount) => {
    await Model.updateOne({ _id }, { "automod.max_role_mentions": amount });
    if (cache.contains(_id)) {
      cache.get(_id).automod.max_role_mentions = amount;
    }
  },

  maxLines: async (_id, amount) => {
    await Model.updateOne({ _id }, { "automod.max_lines": amount });
    if (cache.contains(_id)) {
      cache.get(_id).automod.max_lines = amount;
    }
  },

  inviteTracking: async (_id, status) => {
    await Model.updateOne({ _id }, { "invite.tracking": status });
    if (cache.contains(_id)) {
      cache.get(_id).invite.tracking = status;
    }
  },

  addInviteRank: async (_id, roleId, invites) => {
    const toPush = {
      _id: roleId,
      invites,
    };

    await Model.updateOne({ _id }, { $push: { "invite.ranks": toPush } });
    if (cache.contains(_id)) {
      cache.get(_id).invite.ranks.push(toPush);
    }
  },

  removeInviteRank: async (_id, roleId) => {
    await Model.updateOne({ _id }, { $pull: { "invite.ranks": { _id: roleId } } });
    cache.remove(_id);
  },

  flagTranslation: async (_id, status) => {
    await Model.updateOne({ _id }, { "flag_translation.enabled": status });
    if (cache.contains(_id)) {
      cache.get(_id).flag_translation.enabled = status;
    }
  },

  setFlagTrChannels: async (_id, channels) => {
    await Model.updateOne({ _id }, { "flag_translation.channels": channels });
    if (cache.contains(_id)) {
      cache.get(_id).flag_translation.channels = channels;
    }
  },

  modLogChannel: async (_id, channelId) => {
    await Model.updateOne({ _id }, { modlog_channel: channelId });
    if (cache.contains(_id)) {
      cache.get(_id).modlog_channel = channelId;
    }
  },

  maxWarnings: async (_id, amount) => {
    await Model.updateOne({ _id }, { max_warnings: amount });
    if (cache.contains(_id)) {
      cache.get(_id).max_warnings = amount;
    }
  },

  maxWarnAction: async (_id, action) => {
    await Model.updateOne({ _id }, { max_warn_action: action });
    if (cache.contains(_id)) {
      cache.get(_id).max_warn_action = action;
    }
  },
};
