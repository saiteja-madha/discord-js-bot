const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { getMatchingChannel } = require("@utils/guildUtils");
const outdent = require("outdent");

module.exports = class ChannelInfo extends Command {
  constructor(client) {
    super(client, {
      name: "channelinfo",
      description: "shows mentioned channel information",
      command: {
        enabled: true,
        usage: "[channel]",
        aliases: ["chinfo"],
        category: "INFORMATION",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "channel",
            description: "the channel to get the details for",
            type: "CHANNEL",
            required: false,
          },
        ],
      },
      contextMenu: {
        enabled: false
      }
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { channel, guild } = message;
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    } else if (args.length > 0) {
      const search = args.join(" ");
      const tcByName = getMatchingChannel(guild, search);
      if (tcByName.length === 0) return message.reply(`No channels found matching \`${search}\`!`);
      if (tcByName.length > 1) return message.reply(`Multiple channels found matching \`${search}\`!`);
      [targetChannel] = tcByName;
    } else {
      targetChannel = channel;
    }

    const embed = buildEmbed(targetChannel);
    channel.send({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    const target = options.getChannel("channel") || interaction.channel;
    const embed = buildEmbed(target);
    interaction.followUp({ embeds: [embed] });
  }
};

const channelTypes = {
  GUILD_TEXT: "Text",
  GUILD_PUBLIC_THREAD: "Public Thread",
  GUILD_PRIVATE_THREAD: "Private Thread",
  GUILD_NEWS: "News",
  GUILD_NEWS_THREAD: "News Thread",
  GUILD_VOICE: "Voice",
  GUILD_STAGE_VOICE: "Stage Voice",
};

const buildEmbed = (channel) => {
  const { id, name, topic, parent, position, type } = channel;

  let desc = outdent`
    ${EMOJIS.ARROW} ID: **${id}**
    ${EMOJIS.ARROW} Name: **${name}**
    ${EMOJIS.ARROW} Type: **${channelTypes[type] || type}**
    ${EMOJIS.ARROW} Category: **${parent || "NA"}**
    ${EMOJIS.ARROW} Topic: **${topic || "No topic set"}**\n
    `;

  if (type === "GUILD_TEXT") {
    const { rateLimitPerUser, nsfw } = channel;
    desc += outdent`
      ${EMOJIS.ARROW} Position: **${position}**
      ${EMOJIS.ARROW} Slowmode: **${rateLimitPerUser}**
      ${EMOJIS.ARROW} isNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
  }

  if (type === "GUILD_PUBLIC_THREAD" || type === "GUILD_PRIVATE_THREAD") {
    const { ownerId, archived, locked } = channel;
    desc += outdent`
      ${EMOJIS.ARROW} Owner Id: **${ownerId}**
      ${EMOJIS.ARROW} Is Archived: **${archived ? EMOJIS.TICK : EMOJIS.X_MARK}**
      ${EMOJIS.ARROW} Is Locked: **${locked ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
  }

  if (type === "GUILD_NEWS" || type === "GUILD_NEWS_THREAD") {
    const { nsfw } = channel;
    desc += outdent`
      ${EMOJIS.ARROW} isNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
  }

  if (type === "GUILD_VOICE" || type === "GUILD_STAGE_VOICE ") {
    const { bitrate, userLimit, full } = channel;
    desc += outdent`
      ${EMOJIS.ARROW} Position: **${position}**
      ${EMOJIS.ARROW} Bitrate: **${bitrate}**
      ${EMOJIS.ARROW} User Limit: **${userLimit}**
      ${EMOJIS.ARROW} isFull: **${full ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
  }

  const embed = new MessageEmbed().setAuthor("Channel Details").setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);

  return embed;
};
