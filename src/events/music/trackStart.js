const { BotClient } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const prettyMs = require("pretty-ms");

/**
 *
 * @param {BotClient} client
 * @param {import("erela.js").Player} player
 * @param {import("erela.js").Track} track
 */
module.exports = (client, player, track) => {
  const channel = client.channels.cache.get(player.textChannel);

  const embed = new MessageEmbed()
    .setAuthor("Now Playing")
    .setThumbnail(track.displayThumbnail("hqdefault"))
    .setColor(client.config.EMBED_COLORS.BOT_EMBED)
    .setDescription(`[${track.title}](${track.uri})`)
    .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
    .setFooter(`Requested By: ${track.requester.tag}`);

  if (player.queue.totalSize > 0) embed.addField("Position in Queue", (player.queue.size - 0).toString(), true);

  channel.send({ embeds: [embed] });
};
