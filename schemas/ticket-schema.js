const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = mongoose.Schema({
  guild_id: reqString,
  channel_id: reqString,
  message_id: reqString,
  title: reqString,
  support_role: String,
});

const Model = mongoose.model("settings", Schema);

module.exports = {
  getConfig: async (guildId, channelId, messageId) => {
    await Model.find({
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
    });
  },
};
