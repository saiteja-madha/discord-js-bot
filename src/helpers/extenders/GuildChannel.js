const { GuildChannel } = require("discord.js");

/**
 * Check if bot has permission to send embeds
 */
GuildChannel.prototype.canSendEmbeds = function () {
  return this.permissionsFor(this.guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"]);
};

/**
 * Safely send a message to the channel
 * @param {string|import('discord.js').MessagePayload|import('discord.js').MessageOptions} content
 * @param {number} [seconds]
 */
GuildChannel.prototype.safeSend = async function (content, seconds) {
  if (!content) return;
  if (!this.isText() && !this.isThread()) return;

  const perms = ["VIEW_CHANNEL", "SEND_MESSAGES"];
  if (content.embeds && content.embeds.length > 0) perms.push("EMBED_LINKS");
  if (!this.permissionsFor(this.guild.me).has(perms)) return;

  try {
    if (!seconds) return await this.send(content);
    const reply = await this.send(content);
    setTimeout(() => reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    this.client.logger.error(`safeSend`, ex);
  }
};
