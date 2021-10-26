const { CommandInteraction, GuildMember, MessageEmbed, User, Guild, Util, Channel } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { EMBED_COLORS, EMOJIS } = require("@root/config");
const { outdent } = require("outdent");
const moment = require("moment");
const botstats = require("./shared/botstats");

module.exports = class Info extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "info",
      description: "shows information about the user",
      enabled: true,
      ephemeral: false,
      category: "INFORMATION",
      options: [
        {
          name: "user",
          description: "get user information",
          type: "SUB_COMMAND",
          options: [
            {
              name: "name",
              description: "name of the user",
              type: "USER",
              required: false,
            },
          ],
        },
        {
          name: "channel",
          description: "get channel information",
          type: "SUB_COMMAND",
          options: [
            {
              name: "name",
              description: "name of the channel",
              type: "CHANNEL",
              required: false,
            },
          ],
        },
        {
          name: "guild",
          description: "get guild information",
          type: "SUB_COMMAND",
        },
        {
          name: "bot",
          description: "get bot information",
          type: "SUB_COMMAND",
        },
        {
          name: "avatar",
          description: "displays avatar information",
          type: "SUB_COMMAND",
          options: [
            {
              name: "name",
              description: "name of the user",
              type: "USER",
              required: false,
            },
          ],
        },
        {
          name: "emoji",
          description: "displays emoji information",
          type: "SUB_COMMAND",
          options: [
            {
              name: "name",
              description: "name of the emoji",
              type: "STRING",
              required: true,
            },
          ],
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Not a valid subcommand");
    let response;

    // user
    if (sub === "user") {
      let targetUser = interaction.options.getUser("name") || interaction.user;
      let target = await interaction.guild.members.fetch(targetUser);
      response = userInfo(target);
    }

    // channel
    else if (sub === "channel") {
      let targetChannel = interaction.options.getChannel("name") || interaction.channel;
      response = channelInfo(targetChannel);
    }

    // guild
    else if (sub === "guild") {
      response = await guildInfo(interaction.guild);
    }

    // bot
    else if (sub === "bot") {
      response = botstats(interaction.client);
    }

    // avatar
    else if (sub === "avatar") {
      let target = interaction.options.getUser("name") || interaction.user;
      response = avatar(target);
    }

    // emoji
    else if (sub === "emoji") {
      let emoji = interaction.options.getString("name");
      response = emojiInfo(emoji);
    }

    // return
    else {
      return interaction.followUp("Incorrect subcommand");
    }

    await interaction.followUp(response);
  }
};

/**
 * @param {GuildMember} member
 */
const userInfo = (member) => {
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  const embed = new MessageEmbed()
    .setAuthor(`User information for ${member.displayName}`, member.user.displayAvatarURL())
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addField("User Tag", member.user.tag, true)
    .addField("ID", member.id, true)
    .addField("Guild Joined", member.joinedAt.toUTCString())
    .addField("Discord Registered", member.user.createdAt.toUTCString())
    .addField(`Roles [${member.roles.cache.size}]`, member.roles.cache.map((r) => r.name).join(", "), false)
    .addField("Avatar-URL", member.user.displayAvatarURL({ format: "png" }))
    .setFooter(`Requested by ${member.user.tag}`)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};

/**
 * @param {Channel} channel
 */
const channelInfo = (channel) => {
  const { id, name, topic, parent, position, type } = channel;

  const channelTypes = {
    GUILD_TEXT: "Text",
    GUILD_PUBLIC_THREAD: "Public Thread",
    GUILD_PRIVATE_THREAD: "Private Thread",
    GUILD_NEWS: "News",
    GUILD_NEWS_THREAD: "News Thread",
    GUILD_VOICE: "Voice",
    GUILD_STAGE_VOICE: "Stage Voice",
  };

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

  return { embeds: [embed] };
};

/**
 * @param {Guild} guild
 */
const guildInfo = async (guild) => {
  const { name, id, preferredLocale, channels, roles, ownerId } = guild;

  const owner = await guild.members.fetch(ownerId);
  const createdAt = moment(guild.createdAt);

  const totalChannels = channels.cache.size;
  const categories = channels.cache.filter((c) => c.type === "GUILD_CATEGORY").size;
  const textChannels = channels.cache.filter((c) => c.type === "GUILD_TEXT").size;
  const voiceChannels = channels.cache.filter((c) => c.type === "GUILD_VOICE" || c.type === "GUILD_STAGE_VOICE").size;
  const threadChannels = channels.cache.filter(
    (c) => c.type === "GUILD_PRIVATE_THREAD" || c.type === "GUILD_PUBLIC_THREAD"
  ).size;

  const memberCache = guild.members.cache;
  const all = memberCache.size;
  const bots = memberCache.filter((m) => m.user.bot).size;
  const users = all - bots;
  const onlineUsers = memberCache.filter((m) => !m.user.bot && m.presence?.status === "online").size;
  const onlineBots = memberCache.filter((m) => m.user.bot && m.presence?.status === "online").size;
  const onlineAll = onlineUsers + onlineBots;
  const rolesCount = roles.cache.size;

  const getMembersInRole = (members, role) => {
    return members.filter((m) => m.roles.cache.has(role.id)).size;
  };

  const rolesString = roles.cache
    .filter((r) => !r.name.includes("everyone"))
    .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
    .join(", ");

  let { verificationLevel } = guild;
  switch (guild.verificationLevel) {
    case "VERY_HIGH":
      verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
      break;

    case "HIGH":
      verificationLevel = "(╯°□°）╯︵ ┻�?┻";
      break;

    default:
      break;
  }

  let desc = "";
  desc = `${desc + EMOJIS.ARROW} **Id:** ${id}\n`;
  desc = `${desc + EMOJIS.ARROW} **Name:** ${name}\n`;
  desc = `${desc + EMOJIS.ARROW} **Owner:** ${owner.user.tag}\n`;
  desc = `${desc + EMOJIS.ARROW} **Region:** ${preferredLocale}\n`;
  desc += "\n";

  const embed = new MessageEmbed()
    .setTitle("GUILD INFORMATION")
    .setThumbnail(guild.iconURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addField(`Server Members [${all}]`, `\`\`\`Members: ${users}\nBots: ${bots}\`\`\``, true)
    .addField(`Online Stats [${onlineAll}]`, `\`\`\`Members: ${onlineUsers}\nBots: ${onlineBots}\`\`\``, true)
    .addField(
      `Categories and channels [${totalChannels}]`,
      `\`\`\`Categories: ${categories} | Text: ${textChannels} | Voice: ${voiceChannels} | Thread: ${threadChannels}\`\`\``,
      false
    )
    .addField(`Roles [${rolesCount}]`, `\`\`\`${rolesString}\`\`\``, false)
    .addField("Verification", `\`\`\`${verificationLevel}\`\`\``, true)
    .addField("Boost Count", `\`\`\`${guild.premiumSubscriptionCount}\`\`\``, true)
    .addField(
      `Server Created [${createdAt.fromNow()}]`,
      `\`\`\`${createdAt.format("dddd, Do MMMM YYYY")}\`\`\``,
      false
    );

  if (guild.splashURL) embed.setImage(guild.splashURL);

  return { embeds: [embed] };
};

/**
 * @param {User} user
 */
const avatar = (user) => {
  const x64 = user.displayAvatarURL({ format: "png", dynamic: true, size: 64 });
  const x128 = user.displayAvatarURL({ format: "png", dynamic: true, size: 128 });
  const x256 = user.displayAvatarURL({ format: "png", dynamic: true, size: 256 });
  const x512 = user.displayAvatarURL({ format: "png", dynamic: true, size: 512 });
  const x1024 = user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 });
  const x2048 = user.displayAvatarURL({ format: "png", dynamic: true, size: 2048 });

  const embed = new MessageEmbed()
    .setTitle(`Avatar of ${user.username}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(x256)
    .setDescription(
      `Links: ${EMOJIS.CIRCLE_BULLET} [x64](${x64}) ` +
        `${EMOJIS.CIRCLE_BULLET} [x128](${x128}) ` +
        `${EMOJIS.CIRCLE_BULLET} [x256](${x256}) ` +
        `${EMOJIS.CIRCLE_BULLET} [x512](${x512}) ` +
        `${EMOJIS.CIRCLE_BULLET} [x1024](${x1024}) ` +
        `${EMOJIS.CIRCLE_BULLET} [x2048](${x2048}) `
    );

  return {
    embeds: [embed],
  };
};

/**
 * @param {string} emoji
 */
const emojiInfo = (emoji) => {
  let custom = Util.parseEmoji(emoji);
  if (!custom.id) return "This is not a valid guild emoji";

  let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor("Emoji Info")
    .setDescription(
      `**Id:** ${custom.id}\n` + `**Name:** ${custom.name}\n` + `**Animated:** ${custom.animated ? "Yes" : "No"}`
    )
    .setImage(url);

  return { embeds: [embed] };
};
