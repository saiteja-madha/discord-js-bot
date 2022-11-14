const { ChannelType } = require("discord.js");

/**
 * @param {number} type
 */
module.exports = (type) => {
  switch (type) {
    case ChannelType.GuildText:
      return "Guild Text";
    case ChannelType.GuildVoice:
      return "Guild Voice";
    case ChannelType.GuildCategory:
      return "Guild Category";
    case ChannelType.GuildAnnouncement:
      return "Guild Announcement";
    case ChannelType.AnnouncementThread:
      return "Guild Announcement Thread";
    case ChannelType.PublicThread:
      return "Guild Public Thread";
    case ChannelType.PrivateThread:
      return "Guild Private Thread";
    case ChannelType.GuildStageVoice:
      return "Guild Stage Voice";
    case ChannelType.GuildDirectory:
      return "Guild Directory";
    case ChannelType.GuildForum:
      return "Guild Forum";
    default:
      return "Unknown";
  }
};
