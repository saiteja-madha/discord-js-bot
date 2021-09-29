/* eslint-disable no-case-declarations */
const { Command } = require("@src/structures");
const { Message, MessageEmbed } = require("discord.js");

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
      },
      slashCommand: {
        enabled: false,
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
      return channel.send("You must be in the same voice channel");
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

    let embed = new MessageEmbed().setColor(this.client.config.EMBED_COLORS.BOT_EMBED);
    let track;

    switch (res.loadType) {
      case "NO_MATCHES":
        if (!player.queue.current) player.destroy();
        embed.setDescription("No results found");
        break;

      case "TRACK_LOADED":
        track = res.tracks[0];
        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) {
          return player.play();
        }

        embed
          .setThumbnail(track.displayThumbnail("hqdefault"))
          .setDescription(`**Added Song to queue**\n[${track.title}](${track.uri})`)
          .setFooter(`Requested By: ${track.requester.tag}`);

        break;

      case "PLAYLIST_LOADED":
        player.queue.add(res.tracks);
        if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
          player.play();
        }

        embed.setDescription(
          `**Added Playlist to queue**\nPlaylist: **${res.playlist.name}**\n${res.tracks.length} Songs`
        );

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
          .setFooter("Enter the song number you wish to add to queue");

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
        if (index < 0 || index > max - 1)
          return message.reply(`the number you provided too small or too big (1-${max}).`);

        track = res.tracks[index];

        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) return player.play();

        embed
          .setThumbnail(track.displayThumbnail("hqdefault"))
          .setDescription(`**Added Song to queue**\n[${track.title}](${track.uri})`)
          .setFooter(`Requested By: ${track.requester.tag}`);
    }

    channel.send({ embeds: [embed] });
  }
};
