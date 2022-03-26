const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { stripIndent } = require("common-tags");

const channelTypes = {
  GUILD_TEXT: "Text",
  GUILD_PUBLIC_THREAD: "Public Thread",
  GUILD_PRIVATE_THREAD: "Private Thread",
  GUILD_NEWS: "News",
  GUILD_NEWS_THREAD: "News Thread",
  GUILD_VOICE: "Voice",
  GUILD_STAGE_VOICE: "Stage Voice",
};

module.exports = (channel) => {
  const { id, name, topic, parent, position, type } = channel;

  let desc = stripIndent`
    ❯ ID: **${id}**
    ❯ Name: **${name}**
    ❯ Type: **${channelTypes[type] || type}**
    ❯ Category: **${parent || "NA"}**
    ❯ Topic: **${topic || "No topic set"}**\n
    `;

  if (type === "GUILD_TEXT") {
    const { rateLimitPerUser, nsfw } = channel;
    desc += stripIndent`
      ❯ Position: **${position}**
      ❯ Slowmode: **${rateLimitPerUser}**
      ❯ isNSFW: **${nsfw ? "✓" : "✕"}**
      `;
  }

  if (type === "GUILD_PUBLIC_THREAD" || type === "GUILD_PRIVATE_THREAD") {
    const { ownerId, archived, locked } = channel;
    desc += stripIndent`
      ❯ Owner Id: **${ownerId}**
      ❯ Is Archived: **${archived ? "✓" : "✕"}**
      ❯ Is Locked: **${locked ? "✓" : "✕"}**
      `;
  }

  if (type === "GUILD_NEWS" || type === "GUILD_NEWS_THREAD") {
    const { nsfw } = channel;
    desc += stripIndent`
      ❯ isNSFW: **${nsfw ? "✓" : "✕"}**
      `;
  }

  if (type === "GUILD_VOICE" || type === "GUILD_STAGE_VOICE ") {
    const { bitrate, userLimit, full } = channel;
    desc += stripIndent`
      ❯ Position: **${position}**
      ❯ Bitrate: **${bitrate}**
      ❯ User Limit: **${userLimit}**
      ❯ isFull: **${full ? "✓" : "✕"}**
      `;
  }

  const embed = new MessageEmbed()
    .setAuthor({ name: "Channel Details" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc);

  return { embeds: [embed] };
};
