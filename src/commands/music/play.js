const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, MUSIC } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "play",
  description: "play a song from youtube",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["p"],
    usage: "<song-name>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        description: "song name or url",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await play(message, query);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("query");
    const response = await play(interaction, query);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function play({ member, guild, channel }, query) {
  if (!member.voice.channel) return "🚫 You need to join a voice channel first";

  let player = guild.client.manager.getPlayer(guild.id);

  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "🚫 You must be in the same voice channel as mine";
  }

  if (!player) {
    player = await guild.client.manager.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channel.id,
      textChannelId: channel.id,
      selfMute: false,
      selfDeaf: true,
      volume: MUSIC.DEFAULT_VOLUME,
      vcRegion: member.voice.channel.rtcRegion,
    });
  }

  if (!player.connected) await player.connect();

  const res = await player.search({ query }, member.user);

  if (!res || !res.tracks?.length) {
    return {
      embeds: [new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("No results found!")],
    };
  }

  if (res.loadType === "playlist") {
    player.queue.add(res.tracks);

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Added Playlist to queue" })
      .setThumbnail(res.playlist.thumbnail)
      .setDescription(`[${res.playlist.name}](${res.playlist.uri})`)
      .addFields(
        { name: "Enqueued", value: `${res.tracks.length} songs`, inline: true },
        {
          name: "Playlist duration",
          value:
            "`" +
            guild.client.utils.formatTime(res.tracks.map((t) => t.info.duration).reduce((a, b) => a + b, 0)) +
            "`",
          inline: true,
        }
      )
      .setFooter({ text: `Requested By: ${member.user.username}` });

    if (!player.playing && player.queue.tracks.length > 0) {
      await player.play({ paused: false });
    }

    return { embeds: [embed] };
  }

  player.queue.add(res.tracks[0]);

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Added Track to queue" })
    .setDescription(`[${res.tracks[0].info.title}](${res.tracks[0].info.uri})`)
    .setThumbnail(res.tracks[0].info.artworkUrl)
    .addFields({
      name: "Song Duration",
      value: "`" + guild.client.utils.formatTime(res.tracks[0].info.duration) + "`",
      inline: true,
    })
    .setFooter({ text: `Requested By: ${res.tracks[0].requester.username}` });

  if (player.queue?.tracks?.length > 1) {
    embed.addFields({
      name: "Position in Queue",
      value: player.queue.tracks.length.toString(),
      inline: true,
    });
  }

  if (!player.playing && player.queue.tracks.length > 0) {
    await player.play({ paused: false });
  }

  return { embeds: [embed] };
}