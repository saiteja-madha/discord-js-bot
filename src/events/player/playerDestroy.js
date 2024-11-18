module.exports = async (client, player) => {
  const guild = client.guilds.cache.get(player.guildId);
  if (!guild) return;

  if (player.voiceChannelId) {
    await client.utils.setVoiceStatus(client, player.voiceChannelId, "");
  }

  const msg = player.get("message");
  if (msg && msg.deletable) {
    await msg.delete().catch(() => {});
  }
};
