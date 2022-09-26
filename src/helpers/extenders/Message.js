const { Message } = require("discord.js");

/**
 * @param {string|import('discord.js').MessagePayload|import('discord.js').MessageOptions} content
 * @param {number} [seconds]
 */
Message.prototype.safeReply = async function (content, seconds) {
  if (!content) return;
  const perms = ["ViewChannel", "SendMessages"];
  if (content.embeds && content.embeds.length > 0) perms.push("EmbedLinks");
  if (this.channel.type !== "DM" && !this.channel.permissionsFor(this.guild.members.me).has(perms)) return;

  perms.push("ReadMessageHistory");
  if (this.channel.type !== "DM" && !this.channel.permissionsFor(this.guild.members.me).has(perms)) {
    return this.channel.safeSend(content, seconds);
  }

  try {
    if (!seconds) return await this.reply(content);
    const reply = await this.reply(content);
    setTimeout(() => reply.deletable && reply.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    this.client.logger.error(`safeReply`, ex);
  }
};
