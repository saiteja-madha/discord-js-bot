module.exports = async (client, player) => {
  if (player.repeatMode === "track") return;
  if (!player.textChannelId) return;

  const messageId = player.get("messageId");
  if (!messageId) return;

  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message || !message.deletable) return;

  await message.delete().catch(() => {});

  player.set("messageId", undefined);
};
