const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const prettyMs = require("pretty-ms");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "play",
  description: "play a song from youtube",
  category: "ERELA_JS",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
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
    const response = await play(message, message.author, query);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("query");
    const response = await play(interaction, interaction.user, query);
    await interaction.followUp(response);
  },
};

async function play({ member, guild, channel }, user, query) {
  if (!member.voice.channel) return "🚫 You need to join a voice channel first";
  let player = guild.client.erelaManager.get(guild.id);

  if (player && !guild.members.me.voice.channel) player.destroy();
  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "🚫 You must be in the same voice channel as mine";
  }

  try {
    player = guild.client.erelaManager.create({
      guild: guild.id,
      textChannel: channel.id,
      voiceChannel: member.voice.channel.id,
      volume: 50,
    });
  } catch (ex) {
    if (ex.message === "No available nodes.") {
      guild.client.logger.debug("No available nodes!");
      return "🚫 No available nodes! Try again later";
    }
  }

  if (player.state !== "CONNECTED") player.connect();
  let res;

  try {
    res = await player.search(query, user);
    if (res.loadType === "LOAD_FAILED") {
      if (!player.queue.current) player.destroy();
      throw res.exception;
    }
  } catch (err) {
    guild.client.logger.error("Search Exception", err);
    return "There was an error while searching";
  }

  let embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED);
  let track;

  switch (res.loadType) {
    case "NO_MATCHES":
      if (!player.queue.current) player.destroy();
      return `No results found matching ${query}`;

    case "TRACK_LOADED": {
      track = res.tracks[0];
      player.queue.add(track);
      if (!player.playing && !player.paused && !player.queue.size) {
        player.play();
        return "> 🎶 Adding song to queue";
      }

      const fields = [];
      embed
        .setAuthor({ name: "Added Song to queue" })
        .setDescription(`[${track.title}](${track.uri})`)
        .setFooter({ text: `Requested By: ${track.requester.tag}` });

      fields.push({
        name: "Song Duration",
        value: "`" + prettyMs(track.duration, { colonNotation: true }) + "`",
        inline: true,
      });

      if (typeof track.displayThumbnail === "function") embed.setThumbnail(track.displayThumbnail("hqdefault"));
      if (player.queue.totalSize > 0) {
        fields.push({
          name: "Position in Queue",
          value: (player.queue.size - 0).toString(),
          inline: true,
        });
      }
      return { embeds: [embed] };
    }
    case "PLAYLIST_LOADED":
      player.queue.add(res.tracks);
      if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
        player.play();
      }

      embed
        .setAuthor({ name: "Added Playlist to queue" })
        .setDescription(res.playlist.name)
        .addFields(
          {
            name: "Enqueued",
            value: `${res.tracks.length} songs`,
            inline: true,
          },
          {
            name: "Playlist duration",
            value: "`" + prettyMs(res.playlist.duration, { colonNotation: true }) + "`",
            inline: true,
          }
        )
        .setFooter({ text: `Requested By: ${res.tracks[0].requester.tag}` });

      return { embeds: [embed] };

    case "SEARCH_RESULT": {
      track = res.tracks[0];
      player.queue.add(track);
      if (!player.playing && !player.paused && !player.queue.size) {
        player.play();
        return "> 🎶 Adding song to queue";
      }

      const fields = [];
      embed
        .setAuthor({ name: "Added Song to queue" })
        .setDescription(`[${track.title}](${track.uri})`)
        .setFooter({ text: `Requested By: ${track.requester.tag}` });

      fields.push({
        name: "Song Duration",
        value: "`" + prettyMs(track.duration, { colonNotation: true }) + "`",
        inline: true,
      });

      if (player.queue.totalSize > 0) {
        fields.push({
          name: "Position in Queue",
          value: (player.queue.size - 0).toString(),
          inline: true,
        });
      }

      embed.addFields(fields);
      return { embeds: [embed] };
    }
  }
}
