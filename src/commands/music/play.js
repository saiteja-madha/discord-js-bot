/* eslint-disable no-case-declarations */
const { EMBED_COLORS } = require("@root/config");
const { Command } = require("@src/structures");
const { Message, MessageEmbed } = require("discord.js");
const prettyMs = require("pretty-ms");

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "play a song from youtube",
      command: {
        enabled: true,
        usage: "<song-name>",
        minArgsCount: 1,
        category: "MUSIC",
        botPermissions: ["EMBED_LINKS"],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { guild, channel, member } = message;
    const query = args.join(" ");

    if (!member.voice.channel) return channel.send("You need to join a voice channel first");
    let player = message.client.musicManager.get(guild.id);

    if (player && member.voice.channel !== guild.me.voice.channel) {
      return channel.send("You must be in the same voice channel as mine");
    }

    player = message.client.musicManager.create({
      guild: guild.id,
      textChannel: channel.id,
      voiceChannel: member.voice.channel.id,
      volume: 50,
    });

    if (player.state !== "CONNECTED") player.connect();
    let res;

    try {
      res = await player.search(query, message.author);
      if (res.loadType === "LOAD_FAILED") {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      this.client.logger.error("Search Exception", err);
      return channel.send("There was an error while searching");
    }

    let embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED);
    let track;

    switch (res.loadType) {
      case "NO_MATCHES":
        if (!player.queue.current) player.destroy();
        return channel.send(`No results found matching ${query}`);

      case "TRACK_LOADED":
        track = res.tracks[0];
        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) {
          return player.play();
        }

        embed
          .setThumbnail(track.displayThumbnail("hqdefault"))
          .setAuthor("Added Song to queue")
          .setDescription(`[${track.title}](${track.uri})`)
          .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
          .setFooter(`Requested By: ${track.requester.tag}`);

        if (player.queue.totalSize > 0) embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);

        break;

      case "PLAYLIST_LOADED":
        player.queue.add(res.tracks);
        if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
          player.play();
        }

        embed
          .setAuthor("Added Playlist to queue")
          .setDescription(res.playlist.name)
          .addField("Enqueued", `${res.tracks.length} songs`, true)
          .addField("Playlist duration", "`" + prettyMs(res.playlist.duration, { colonNotation: true }) + "`", true)
          .setFooter(`Requested By: ${res.tracks[0].requester.tag}`);

        break;

      case "SEARCH_RESULT":
        let max = this.client.config.MUSIC.MAX_SEARCH_RESULTS,
          collector;

        if (res.tracks.length < max) max = res.tracks.length;

        const results = res.tracks
          .slice(0, max)
          .map((track, index) => `${this.client.config.EMOJIS.ARROW} ${++index}: ${track.title}`)
          .join("\n");

        embed
          .setAuthor("Search Results")
          .setDescription(results)
          .setFooter("Please enter song number you wish to add to queue. Type 'end' to cancel");

        channel.send({ embeds: [embed] });

        try {
          collector = await channel.awaitMessages({
            filter: (m) => m.author.id === message.author.id,
            max: 1,
            time: 30e3,
            errors: ["time"],
          });
        } catch (e) {
          if (!player.queue.current) player.destroy();
          return message.reply("you didn't provide a selection.");
        }

        const first = collector.first().content;

        if (first.toLowerCase() === "end") {
          if (!player.queue.current) player.destroy();
          return channel.send("Cancelled selection.");
        }

        const index = Number(first) - 1;
        if (isNaN(index) || index < 0 || index > max - 1)
          return message.reply(`You must provide a valid number input between (1-${max}).`);

        track = res.tracks[index];

        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) return player.play();

        embed
          .setThumbnail(track.displayThumbnail("hqdefault"))
          .setAuthor("Added Song to queue")
          .setDescription(`[${track.title}](${track.uri})`)
          .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
          .setFooter(`Requested By: ${track.requester.tag}`);

        if (player.queue.totalSize > 0) embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);
    }

    channel.send({ embeds: [embed] });
  }
};
