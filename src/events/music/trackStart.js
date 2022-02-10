const { MessageEmbed } = require("discord.js");
const prettyMs = require("pretty-ms");
const { sendMessage } = require("@utils/botUtils");

/**
 * Emitted when a track starts.
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Player} player
 * @param {import("erela.js").Track} track
 * @param {import("erela.js").TrackStartEvent} payload
 */
module.exports = (client, player, track, payload) => {
  const channel = client.channels.cache.get(player.textChannel);

  const embed = new MessageEmbed()
    .setAuthor({ name: "Now Playing" })
    .setColor(client.config.EMBED_COLORS.BOT_EMBED)
    .setDescription(`[${track.title}](${track.uri})`)
    .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
    .setFooter({ text: `Requested By: ${track.requester.tag}` });

  if (typeof track.displayThumbnail === "function") embed.setThumbnail(track.displayThumbnail("hqdefault"));
  if (player.queue.totalSize > 0) embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);
  sendMessage(channel, { embeds: [embed] });
};
