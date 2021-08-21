const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { getMatchingChannel } = require("@utils/guildUtils");
const outdent = require("outdent");
const { channelTypes } = require("@utils/botUtils");

module.exports = class ChannelInfo extends Command {
  constructor(client) {
    super(client, {
      name: "chinfo",
      description: "shows mentioned channel information",
      usage: "[channel]",
      aliases: ["channelinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, channel, guild } = ctx;
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    } else {
      if (args.length > 0) {
        const search = args.join(" ");
        const tcByName = getMatchingChannel(guild, search);
        if (tcByName.length == 0) return ctx.reply(`No channels found matching \`${search}\`!`);
        if (tcByName.length > 1) return ctx.reply(`Multiple channels found matching \`${search}\`!`);
        targetChannel = tcByName[0];
      } else {
        targetChannel = channel;
      }
    }

    const { id, name, topic, parent, position, type } = targetChannel;

    let desc = outdent`
    ${EMOJIS.ARROW} ID: **${id}**
    ${EMOJIS.ARROW} Name: **${name}**
    ${EMOJIS.ARROW} Type: **${channelTypes[type] || type}**
    ${EMOJIS.ARROW} Category: **${parent ? parent : "NA"}**
    ${EMOJIS.ARROW} Topic: **${topic ? topic : "No topic set"}**\n
    `;

    if (type === "GUILD_TEXT") {
      const { rateLimitPerUser, nsfw } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} Position: **${position}**
      ${EMOJIS.ARROW} Slowmode: **${rateLimitPerUser}**
      ${EMOJIS.ARROW} isNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "GUILD_PUBLIC_THREAD" || type === "GUILD_PRIVATE_THREAD") {
      const { ownerId, archived, locked } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} Owner Id: **${ownerId}**
      ${EMOJIS.ARROW} Is Archived: **${archived ? EMOJIS.TICK : EMOJIS.X_MARK}**
      ${EMOJIS.ARROW} Is Locked: **${locked ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "GUILD_NEWS" || type === "GUILD_NEWS_THREAD") {
      const { nsfw } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} isNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "GUILD_VOICE" || type === "GUILD_STAGE_VOICE ") {
      const { bitrate, userLimit, full } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} Position: **${position}**
      ${EMOJIS.ARROW} Bitrate: **${bitrate}**
      ${EMOJIS.ARROW} User Limit: **${userLimit}**
      ${EMOJIS.ARROW} isFull: **${full ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    const embed = new MessageEmbed().setAuthor("Channel Details").setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    ctx.reply({ embeds: [embed] });
  }
};
