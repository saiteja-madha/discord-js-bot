const { EmbedBuilder } = require("discord.js");
const { Cluster } = require("lavaclient");
const prettyMs = require("pretty-ms");
const { load, SpotifyItemType } = require("@lavaclient/spotify");
require("@lavaclient/queue/register");

/**
 * @param {import("@structures/BotClient")} client
 */
module.exports = (client) => {
  load({
    client: {
      id: process.env.SPOTIFY_CLIENT_ID,
      secret: process.env.SPOTIFY_CLIENT_SECRET,
    },
    autoResolveYoutubeTracks: false,
    loaders: [SpotifyItemType.Album, SpotifyItemType.Artist, SpotifyItemType.Playlist, SpotifyItemType.Track],
  });

  const lavaclient = new Cluster({
    nodes: client.config.MUSIC.LAVALINK_NODES,
    sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
  });

  client.ws.on("VOICE_SERVER_UPDATE", (data) => lavaclient.handleVoiceUpdate(data));
  client.ws.on("VOICE_STATE_UPDATE", (data) => lavaclient.handleVoiceUpdate(data));

  lavaclient.on("nodeConnect", (node, event) => {
    client.logger.log(`Node "${node.id}" connected`);
  });

  lavaclient.on("nodeDisconnect", (node, event) => {
    client.logger.log(`Node "${node.id}" disconnected`);
  });

  lavaclient.on("nodeError", (node, error) => {
    client.logger.error(`Node "${node.id}" encountered an error: ${error.message}.`, error);
  });

  lavaclient.on("nodeDebug", (node, message) => {
    client.logger.debug(`Node "${node.id}" debug: ${message}`);
  });

  lavaclient.on("nodeTrackStart", async (_node, queue, song) => {
    const fields = [];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Now Playing" })
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`[${song.title}](${song.uri})`)
      .setFooter({ text: `Requested By: ${song.requester}` });

    if (song.sourceName === "youtube") {
      const identifier = song.identifier;
      const thumbnail = `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`;
      embed.setThumbnail(thumbnail);
    }

    fields.push({
      name: "Song Duration",
      value: "`" + prettyMs(song.length, { colonNotation: true }) + "`",
      inline: true,
    });

    if (queue.tracks.length > 0) {
      fields.push({
        name: "Position in Queue",
        value: (queue.tracks.length + 1).toString(),
        inline: true,
      });
    }

    embed.setFields(fields);
    queue.data.channel.safeSend({ embeds: [embed] });

    // update voice channel status with 'Now Playing'
    await client.wait(1000) // waiting 1 sec, because channel id is null initially
    await updateVoiceStatus(queue.player.channelId, `Playing **${song.title}**`, client)
  });

  lavaclient.on("nodeQueueFinish", async (_node, queue) => {
    queue.data.channel.safeSend("Queue has ended.");
    await client.musicManager.destroyPlayer(queue.player.guildId).then(queue.player.disconnect());

    // reset voice channel's status
    await updateVoiceStatus(queue.player.channelId, '', client)
  });

  // for when player is paused, indicate 'paused' in the status
  lavaclient.on('playerPaused', async (player, song) => {
    await updateVoiceStatus(player.channelId, `Paused **${song.title}**`, client)
  })
  // for when player is resumed, indicate 'playing' in the status
  lavaclient.on('playerResumed', async (player, song) => {
    await updateVoiceStatus(player.channelId, `Playing **${song.title}**`, client)
  })
  // for when player is stopped, reset the status
  lavaclient.on('playerDestroy', async (player) => {
    await updateVoiceStatus(player.channelId, '', client)
  })
  return lavaclient;
};

/**
 * 
 * @param {string} channel The channel Id to update the status
 * @param {string} status The status
 * @param {import("discord.js").Client} client Bot's client
 */
async function updateVoiceStatus(channel, status, client) {
  const url = `/channels/${channel}/voice-status`;
  await client.rest.put(url, {
    body: {
      status: status
    }
  })
    .catch(() => { });
}