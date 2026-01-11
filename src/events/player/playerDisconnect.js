module.exports = async (client, player, voiceChannelId) => {
  if (!player) return;

  if (voiceChannelId) {
    await client.utils.setVoiceStatus(client, voiceChannelId, "");
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
