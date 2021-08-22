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

const Model = mongoose.model("ticket-config", Schema);

module.exports = {
  getConfig: async (guildId, channelId, messageId) => {
    return await Model.findOne({
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
    }).lean();
  },

  createNewTicket: async (guildId, channelId, messageId, title, roleId) => {
    await new Model({
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
      title: title,
      support_role: roleId,
    }).save();
  },
};
