const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: reqString,
  channel_id: reqString,
  message_id: reqString,
  roles: [
    {
      _id: false,
      emote: reqString,
      role_id: reqString,
    },
  ],
});

const Model = mongoose.model("reaction-roles", Schema);

// Cache
const cache = new Map();
const getKey = (guildId, channelId, messageId) => guildId + "|" + channelId + "|" + messageId;

module.exports = {
  loadReactionRoles: async () => {
    cache.clear();
    (await Model.find().lean()).forEach((doc) => {
      const { guild_id, channel_id, message_id, roles } = doc;
      const key = getKey(guild_id, channel_id, message_id);
      cache.set(key, roles);
    });
  },

  addReactionRole: async (guildId, channelId, messageId, emote, roleId) => {
    const filter = {
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
    };

    // Pull if existing emote:role found
    await Model.updateOne(filter, { $pull: { roles: { emote: emote } } });

    // Add new one to array
    const data = await Model.findOneAndUpdate(
      filter,
      { $addToSet: { roles: { emote: emote, role_id: roleId } } },
      { upsert: true, new: true }
    ).lean();

    cache.set(getKey(guildId, channelId, messageId), data.roles);
  },

  removeReactionRole: async (guildId, channelId, messageId) => {
    const filter = messageId
      ? {
          guild_id: guildId,
          channel_id: channelId,
          message_id: messageId,
        }
      : {
          guild_id: guildId,
          channel_id: channelId,
        };

    await Model.deleteOne(filter);
    cache.delete(getKey(guildId, channelId, messageId));
  },

  getReactionRole: (guildId, channelId, messageId) => {
    return cache.get(getKey(guildId, channelId, messageId));
  },
};
