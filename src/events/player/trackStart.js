const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = async (client, player, track) => {
  if (player.repeatMode === "track") return;
  if (!(player.textChannelId && player.voiceChannelId)) return;
  if (!track) return;

  if (player.voiceChannelId) {
    await client.utils.setVoiceStatus(
      client,
      player.voiceChannelId,
      `Now playing: **${client.utils.sliceText(track.info.title)}**`
    );
  }

  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel || !channel.isSendable()) return;

  const previous = await player.queue.shiftPrevious();

  const row = (player) =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("previous").setEmoji("⏪").setStyle(ButtonStyle.Secondary).setDisabled(!previous),
      new ButtonBuilder()
        .setCustomId("pause")
        .setEmoji(player.paused ? "▶️" : "⏸️")
        .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("skip").setEmoji("⏩").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("shuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary)
    );

  const message = await channel.safeSend({
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "Track Started" })
        .setDescription(`🎶 **Now playing [${client.utils.sliceText(track.info.title)}](${track.info.uri})**`)
        .setThumbnail(track.info.artworkUrl)
        .setFooter({
          text: `Requested by: ${track.requester.username}`,
        })
        .addFields(
          {
            name: "Duration",
            value: track.info.isStream ? "LIVE" : client.utils.formatTime(track.info.duration),
            inline: true,
          },
          { name: "Author", value: track.info.author || "Unknown", inline: true }
        ),
    ],
    components: [row(player)],
  });

  if (!message) return;
  player.set("messageId", message.id);

  const collector = message.createMessageComponentCollector({
    filter: async (i) => i.guild.members.me.voice.channelId === i.member.voice.channelId,
  });

  collector.on("collect", async (i) => {
    if (!i.isButton()) return;

    await i.deferReply({ ephemeral: true });
    let description;

    switch (i.customId) {
      case "previous":
        description = previous ? "Playing the previous track" : "No previous track available";
        if (previous) player.play({ clientTrack: previous });
        break;

      case "pause":
        if (player.paused) {
          player.resume();
          description = "Track resumed";
        } else {
          player.pause();
          description = "Track paused";
        }
        await message.edit({ components: [row(player)] });
        break;

      case "stop":
        player.stopPlaying(true, false);
        description = "Playback stopped";
        break;

      case "skip":
        description = player.queue.tracks.length > 0 ? "Skipped to the next track" : "The queue is empty!";
        if (player.queue.tracks.length > 0) player.skip();
        break;

      case "shuffle":
        if (player.queue.tracks.length < 2) {
          description = "The queue is too short to shuffle!";
        } else {
          player.queue.shuffle();
          description = "The queue has been shuffled!";
        }
        break;
    }

    await i.followUp({
      embeds: [new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription(description)],
    });
  });
};
