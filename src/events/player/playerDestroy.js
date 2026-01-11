module.exports = async (client, player) => {
  if (!player) return;

  const voiceChannelId = player.voiceChannelId ?? player.options.voiceChannelId;
  if (voiceChannelId) {
    await this.client.utils.setVoiceStatus(client, voiceChannelId, "");
  }

  if (!player.textChannelId) return;

  const messageId = player.get("messageId");
  if (!messageId) return;

  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message || !message.deletable) return;

  await message.delete().catch(() => {});
};
