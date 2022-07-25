const { GuildChannel, ChannelType } = require("discord.js");

/**
 * Check if bot has permission to send embeds
 */
GuildChannel.prototype.canSendEmbeds = function () {
  return this.permissionsFor(this.guild.members.me).has(["ViewChannel", "SendMessages", "EmbedLinks"]);
};

/**
 * Safely send a message to the channel
 * @param {string|import('discord.js').MessagePayload|import('discord.js').MessageOptions} content
 * @param {number} [seconds]
 */
GuildChannel.prototype.safeSend = async function (content, seconds) {
  if (!content) return;
  if (!this.type === ChannelType.GuildText && !this.type === ChannelType.DM) return;

  const perms = ["ViewChannel", "SendMessages"];
  if (content.embeds && content.embeds.length > 0) perms.push("EmbedLinks");
  if (!this.permissionsFor(this.guild.members.me).has(perms)) return;

  try {
    if (!seconds) return await this.send(content);
    const reply = await this.send(content);
    setTimeout(() => reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    this.client.logger.error(`safeSend`, ex);
  }
};
