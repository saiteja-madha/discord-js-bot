const { Message } = require("discord.js");
const { sendMessage } = require("@utils/botUtils");

/**
 * @param {string|import('discord.js').MessagePayload|import('discord.js').MessageOptions} content
 * @param {number} [seconds]
 */
Message.prototype.safeReply = async function (content, seconds) {
  if (!content) return;
  const perms = ["VIEW_CHANNEL", "SEND_MESSAGES"];
  if (content.embeds && content.embeds.length > 0) perms.push("EMBED_LINKS");
  if (this.channel.type !== "DM" && !this.channel.permissionsFor(this.guild.me).has(perms)) return;

  perms.push("READ_MESSAGE_HISTORY");
  if (this.channel.type !== "DM" && !this.channel.permissionsFor(this.guild.me).has(perms)) {
    return sendMessage(this.channel, content, seconds);
  }

  try {
    if (!seconds) return await this.reply(content);
    const reply = await this.reply(content);
    setTimeout(() => reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    this.client.logger.error(`safeReply`, ex);
  }
};
