const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, player) => {
  if (!player) return;

  if (player.voiceChannelId) {
    await client.utils.setVoiceStatus(client, player.voiceChannelId, "");
  }

  if (!player.textChannelId) return;

  const messageId = player.get("messageId");
  if (!messageId) return;

  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel || !channel.isSendable()) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message || !message.deletable) return;

  await message.delete().catch(() => {});
  player.set("messageId", undefined);

  await channel.safeSend(
    {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.BOT_EMBED)
          .setTitle("Queue Finished")
          .setDescription("All tracks have been played. Add more to continue listening"),
      ],
    },
    10
  );
};
