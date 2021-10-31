/* eslint-disable no-case-declarations */
const { SlashCommand } = require("@src/structures");
const { CommandInteraction, MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const prettyMs = require("pretty-ms");

module.exports = class Play extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "search",
      description: "🎵 search a song from youtube",
      enabled: true,
      category: "MUSIC",
      options: [
        {
          name: "query",
          description: "song to search",
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
        let max = this.client.config.MUSIC.MAX_SEARCH_RESULTS;
        if (res.tracks.length < max) max = res.tracks.length;

        const results = res.tracks.slice(0, max);
        const options = results.map((result, index) => ({
          label: result.title,
          value: index.toString(),
        }));

        const menuRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("search-results")
            .setPlaceholder("Choose Search Results")
            .setMaxValues(max)
            .addOptions(options)
        );

        embed.setAuthor("Search Results").setDescription(`Please select the songs you wish to add to queue`);

        await interaction.followUp({
          embeds: [embed],
          components: [menuRow],
        });

        const collector = interaction.channel.createMessageComponentCollector({
          filter: (reactor) => reactor.user.id === interaction.user.id,
          idle: 30 * 1000,
          dispose: true,
        });

        collector.on("collect", async (response) => {
          const toAdd = [];
          response.values.forEach((v) => toAdd.push(results[v]));

          // Only 1 song is selected
          if (toAdd.length === 1) {
            track = toAdd[0];

            player.queue.add(track);
            if (!player.playing && !player.paused && !player.queue.size) {
              await interaction.editReply({
                content: "> 🎶 Adding song to queue",
                embeds: [],
                components: [],
              });
              return player.play();
            }

            embed
              .setThumbnail(track.displayThumbnail("hqdefault"))
              .setAuthor("Added Song to queue")
              .setDescription(`[${track.title}](${track.uri})`)
              .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
              .setFooter(`Requested By: ${track.requester.tag}`);

            if (player.queue.totalSize > 0)
              embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);

            return interaction.editReply({ embeds: [embed], components: [] });
          }

          // Multiple songs were selected
          player.queue.add(toAdd);
          if (!player.playing && !player.paused && player.queue.totalSize === toAdd.length) {
            player.play();
          }

          embed
            .setDescription(`🎶 Added ${toAdd.length} songs to queue`)
            .setFooter(`Requested By: ${res.tracks[0].requester.tag}`);

          return interaction.editReply({ embeds: [embed], components: [] });
        });

        collector.on("end", () => interaction.editReply({ components: [] }));
    }
  }
};
