const { Command } = require("@src/structures");
const { Message, MessageAttachment } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getProfile, getTop100 } = require("@schemas/profile-schema");
const { getBuffer } = require("@utils/httpUtils");
const { getSettings } = require("@schemas/guild-schema");
const { resolveMember } = require("@utils/guildUtils");

const IMAGE_API_BASE = "https://discord-js-image-manipulation.herokuapp.com";

module.exports = class Rank extends Command {
  constructor(client) {
    super(client, {
      name: "rank",
      description: "shows members rank in this server",
      cooldown: 5,
      command: {
        enabled: true,
        category: "INFORMATION",
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const { user } = target;

    const settings = await getSettings(message.guild);
    if (!settings.ranking.enabled) return message.channel.send("Ranking is disabled on this server");

    const profile = await getProfile(message.guildId, user.id);
    if (!profile) return message.channel.send(`${user.tag} is not ranked yet!`);

    const lb = await getTop100(message.guildId);
    let pos = -1;
    lb.forEach((doc, i) => {
      if (doc.member_id == target.id) {
        pos = i + 1;
      }
    });

    const xpNeeded = profile.level * profile.level * 100;

    const url = new URL(`${IMAGE_API_BASE}/utils/rank-card`);
    url.searchParams.append("name", user.username);
    url.searchParams.append("discriminator", user.discriminator);
    url.searchParams.append("avatar", user.displayAvatarURL({ format: "png", size: 128 }));
    url.searchParams.append("currentxp", profile.xp);
    url.searchParams.append("reqxp", xpNeeded);
    url.searchParams.append("level", profile.level);
    url.searchParams.append("barcolor", EMBED_COLORS.BOT_EMBED);
    url.searchParams.append("status", message.member.presence.status.toString());
    if (pos !== -1) url.searchParams.append("rank", pos);

    const response = await getBuffer(url.href);
    if (!response.success) return message.reply("Failed to generate rank-card");

    const attachment = new MessageAttachment(response.buffer, "rank.png");
    message.channel.send({ files: [attachment] });
  }
};
