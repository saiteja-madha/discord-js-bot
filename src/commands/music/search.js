
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS, MUSIC } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "search",
  description: "search for matching songs on YouTube",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["sc"],
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
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} interaction
 * @param {string} query
 */
async function search({ member, guild, channel }, query) {
  if (!member.voice.channel) return "ðŸš« You need to join a voice channel first";

  let player = guild.client.manager.getPlayer(guild.id);

  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "ðŸš« You must be in the same voice channel as me.";
  }

  if (!player) {
    player = await guild.client.manager.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channel.id,
      textChannelId: channel.id,
      selfMute: false,
      selfDeaf: true,
      volume: MUSIC.DEFAULT_VOLUME,
    });
  }

  if (!player.connected) await player.connect();

  const res = await player.search({ query }, member.user);

  if (!res || !res.tracks?.length) {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(`No results found for \`${query}\``),
      ],
    };
  }

  let maxResults = MUSIC.MAX_SEARCH_RESULTS;
  if (res.tracks.length < maxResults) maxResults = res.tracks.length;

  const results = res.tracks.slice(0, maxResults);
  const options = results.map((track, index) => ({
    label: track.info.title,
    value: index.toString(),
  }));

  const menuRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("search-results")
      .setPlaceholder("Choose Search Results")
      .setMaxValues(1)
      .addOptions(options)
  );

  const searchEmbed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Search Results" })
    .setDescription(`Select the song you wish to add to the queue`);

  const searchMessage = await channel.send({
    embeds: [searchEmbed],
    components: [menuRow],
  });

  try {
    const response = await channel.awaitMessageComponent({
      filter: (i) => i.user.id === member.id && i.message.id === searchMessage.id,
      componentType: ComponentType.StringSelect,
      idle: 30 * 1000,
    });

    if (response.customId !== "search-results") return;

    await searchMessage.delete();
    if (!response) return "🚫 You took too long to select the songs";

    const selectedTrack = results[response.values[0]];
    player.queue.add(selectedTrack);

    const trackEmbed = new EmbedBuilder()
      .setAuthor({ name: "Added Track to queue" })
      .setDescription(`[${selectedTrack.info.title}](${selectedTrack.info.uri})`)
      .setThumbnail(selectedTrack.info.artworkUrl)
      .addFields({
        name: "Song Duration",
        value: "`" + guild.client.utils.formatTime(selectedTrack.info.duration) + "`",
        inline: true,
      })
      .setFooter({ text: `Requested By: ${member.user.username}` });

    if (!player.playing && player.queue.tracks.length > 0) {
      await player.play({ paused: false });
    }

    return { embeds: [trackEmbed] };

  } catch (err) {
    console.error("Error handling response:", err);
    await searchMessage.delete();
    return "🚫 Failed to register your response";
  }
}