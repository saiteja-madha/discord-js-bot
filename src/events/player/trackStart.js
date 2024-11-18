const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = async (client, player, track) => {
  const guild = client.guilds.cache.get(player.guildId);
  if (!guild) return;

  if (!player.textChannelId || !track) return;

  const channel = guild.channels.cache.get(player.textChannelId);
  if (!channel) return;

  if (player.get("autoplay") === true) {
    await player.queue.previous.push(track);
  }

  if (player.voiceChannelId) {
    await client.utils.setVoiceStatus(client, player.voiceChannelId, `Paying: **${track.info.title}**`);
  }

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

  const msg = await channel.safeSend({
    embeds: [
      new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "Track Started" })
        .setDescription(`🎶 **Now playing [${track.info.title}](${track.info.uri})**`)
        .setThumbnail(track.info.artworkUrl)
        .setFooter({
          text: `Requested by: ${track.requester.username}`,
        })
        .addFields(
          {
            name: "Duration",
            value: track.info.isStream ? "Live" : client.utils.formatTime(track.info.duration),
            inline: true,
          },
          { name: "Author", value: track.info.author || "Unknown", inline: true }
        ),
    ],
    components: [row(player)],
  });

  if (msg) player.set("message", msg);

  const collector = msg.createMessageComponentCollector({
    filter: async (int) => {
      const sameVc = int.guild.members.me.voice.channelId === int.member.voice.channelId;
      return sameVc;
    },
  });

  collector.on("collect", async (int) => {
    if (!int.isButton()) return;

    await int.deferReply({ ephemeral: true });
    let description;

    switch (int.customId) {
      case "previous":
        description = previous ? "Playing the previous track..." : "No previous track available";
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
        await msg.edit({ components: [row(player)] });
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
    await int.followUp({
      embeds: [new EmbedBuilder().setDescription(description).setColor(EMBED_COLORS.BOT_EMBED)],
    });
  });
};
