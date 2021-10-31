const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const prettyMs = require("pretty-ms");

module.exports = class Play extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "play",
      description: "🎵 play a song from youtube",
      enabled: true,
      category: "MUSIC",
      options: [
        {
          name: "query",
          description: "song name or url",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const { guild, channel, user } = interaction;
    const member = await guild.members.fetch(user.id);
    const query = interaction.options.getString("query");

    if (!member.voice.channel) return interaction.followUp("🚫 You need to join a voice channel first");
    let player = guild.client.musicManager.get(guild.id);

    if (player && member.voice.channel !== guild.me.voice.channel) {
      return interaction.followUp("🚫 You must be in the same voice channel as mine");
    }

    player = guild.client.musicManager.create({
      guild: guild.id,
      textChannel: channel.id,
      voiceChannel: member.voice.channel.id,
      volume: 50,
    });

    if (player.state !== "CONNECTED") player.connect();
    let res;

    try {
      res = await player.search(query, user);
      if (res.loadType === "LOAD_FAILED") {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      this.client.logger.error("Search Exception", err);
      return interaction.followUp("There was an error while searching");
    }

    let embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED);
    let track;

    switch (res.loadType) {
      case "NO_MATCHES":
        if (!player.queue.current) player.destroy();
        return interaction.followUp(`No results found matching ${query}`);

      case "TRACK_LOADED":
        track = res.tracks[0];
        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) {
          await interaction.followUp("> 🎶 Adding song to queue");
          return player.play();
        }

        embed
          .setThumbnail(track.displayThumbnail("hqdefault"))
          .setAuthor("Added Song to queue")
          .setDescription(`[${track.title}](${track.uri})`)
          .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
          .setFooter(`Requested By: ${track.requester.tag}`);

        if (player.queue.totalSize > 0) embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);
        return interaction.followUp({ embeds: [embed] });

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

        return interaction.followUp({ embeds: [embed] });

      case "SEARCH_RESULT":
        track = res.tracks[0];
        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) {
          await interaction.followUp("> 🎶 Adding song to queue");
          return player.play();
        }

        embed
          .setThumbnail(track.displayThumbnail("hqdefault"))
          .setAuthor("Added Song to queue")
          .setDescription(`[${track.title}](${track.uri})`)
          .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
          .setFooter(`Requested By: ${track.requester.tag}`);

        if (player.queue.totalSize > 0) embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);
        return interaction.followUp({ embeds: [embed] });
    }
  }
};
