const { MUSIC, EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, player) => {
  const guild = client.guilds.cache.get(player.guildId);
  if (!guild) return;

  if (player.voiceChannelId) {
    await client.utils.setVoiceStatus(client, player.voiceChannelId, "Silence? Use /play to start the beat!");
  }

  if (player.volume > 100) {
    await player.setVolume(MUSIC.DEFAULT_VOLUME);
  }

  const msg = player.get("message");
  if (msg && msg.deletable) {
    await msg.delete().catch(() => {});
  }

  const channel = guild.channels.cache.get(player.textChannelId);
  if (channel) {
    await channel.safeSend(
      {
        embeds: [new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("Queue has ended.")],
      },
      10
    );
  }
};
