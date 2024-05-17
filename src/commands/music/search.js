const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");
const prettyMs = require("pretty-ms");
const { EMBED_COLORS, MUSIC } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "search",
  description: "search for matching songs on youtube",
  category: "MUSIC",
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
        description: "song to search",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await search(message, query);
    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("query");
    const response = await search(interaction, query);
    if (response) await interaction.followUp(response);
    else interaction.deleteReply();
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function search({ member, guild, channel }, query) {
  if (!member.voice.channel) return "🚫 You need to join a voice channel first";

  let player = guild.client.musicManager.players.resolve(guild.id);
  if (player && !guild.members.me.voice.channel) {
    player.voice.disconnect();
    await guild.client.musicManager.players.destroy(guild.id);
  }
  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "🚫 You must be in the same voice channel as mine";
  }

  let res;
  try {
    res = await guild.client.musicManager.api.loadTracks(
      /^https?:\/\//.test(query) ? query : `${MUSIC.DEFAULT_SOURCE}:${query}`
    );
  } catch (err) {
    return "🚫 There was an error while searching";
  }

  let embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED);
  let tracks;

  switch (res.loadType) {
    case "error":
      guild.client.logger.error("Search Exception", res.data);
      return "🚫 There was an error while searching";

    case "empty":
      return `No results found matching ${query}`;

    case "track": {
      const track = res.data[0];
      tracks = [track];
      if (!player?.playing && !player?.paused && !player?.queue.tracks.length) {
        embed.setAuthor({ name: "Added Song to queue" });
        break;
      }

      const fields = [];
      embed
        .setAuthor({ name: "Added Song to queue" })
        .setDescription(`[${track.info.title}](${track.info.uri})`)
        .setFooter({ text: `Requested By: ${member.user.username}` });

      fields.push({
        name: "Song Duration",
        value: "`" + prettyMs(track.info.length, { colonNotation: true }) + "`",
        inline: true,
      });

      if (player?.queue?.tracks?.length > 0) {
        fields.push({
          name: "Position in Queue",
          value: (player.queue.tracks.length + 1).toString(),
          inline: true,
        });
      }
      embed.addFields(fields);
      break;
    }

    case "playlist":
      tracks = res.data.tracks;
      embed
        .setAuthor({ name: "Added Playlist to queue" })
        .setDescription(res.data.info.name)
        .addFields(
          {
            name: "Enqueued",
            value: `${res.data.tracks.length} songs`,
            inline: true,
          },
          {
            name: "Playlist duration",
            value:
              "`" +
              prettyMs(
                res.data.tracks.map((t) => t.info.length).reduce((a, b) => a + b, 0),
                { colonNotation: true }
              ) +
              "`",
            inline: true,
          }
        )
        .setFooter({ text: `Requested By: ${member.user.username}` });
      break;

    case "search": {
      let max = guild.client.config.MUSIC.MAX_SEARCH_RESULTS;
      if (res.data.length < max) max = res.data.length;

      const results = res.data.slice(0, max);
      const options = results.map((result, index) => ({
        label: result.info.title,
        value: index.toString(),
      }));

      const menuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("search-results")
          .setPlaceholder("Choose Search Results")
          .setMaxValues(max)
          .addOptions(options)
      );

      const tempEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "Search Results" })
        .setDescription(`Please select the songs you wish to add to queue`);

      const sentMsg = await channel.send({
        embeds: [tempEmbed],
        components: [menuRow],
      });

      try {
        const response = await channel.awaitMessageComponent({
          filter: (reactor) => reactor.message.id === sentMsg.id && reactor.user.id === member.id,
          idle: 30 * 1000,
          componentType: ComponentType.StringSelect,
        });

        await sentMsg.delete();
        if (!response) return "🚫 You took too long to select the songs";

        if (response.customId !== "search-results") return;
        const toAdd = [];
        response.values.forEach((v) => toAdd.push(results[v]));

        // Only 1 song is selected
        if (toAdd.length === 1) {
          tracks = [toAdd[0]];
          embed.setAuthor({ name: "Added Song to queue" });
        } else {
          tracks = toAdd;
          embed
            .setDescription(`🎶 Added ${toAdd.length} songs to queue`)
            .setFooter({ text: `Requested By: ${member.user.username}` });
        }
      } catch (err) {
        console.log(err);
        await sentMsg.delete();
        return "🚫 Failed to register your response";
      }
      break;
    }
  }

  // create a player and/or join the member's vc
  if (!player?.connected) {
    player = guild.client.musicManager.players.create(guild.id);
    player.queue.data.channel = channel;
    player.voice.connect(member.voice.channel.id, { deafened: true });
  }

  // do queue things
  const started = player.playing || player.paused;
  player.queue.add(tracks, { requester: member.user.username, next: false });
  if (!started) {
    await player.queue.start();
  }

  return { embeds: [embed] };
}
