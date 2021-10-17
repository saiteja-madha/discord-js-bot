const { BotClient } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const prettyMs = require("pretty-ms");

/**
 * @param {BotClient} client
 */
exports.registerPlayerEvents = (client) => {
  client.musicManager.on("nodeConnect", (node) => client.logger.log(`Node "${node.options.identifier}" connected`));

  client.musicManager.on("nodeError", (node, error) =>
    client.logger.error(`Node "${node.options.identifier}" encountered an error: ${error.message}.`, error)
  );

  client.musicManager.on("trackStart", (player, track) => {
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
  });

  client.musicManager.on("queueEnd", (player) => {
    const channel = client.channels.cache.get(player.textChannel);
    channel.send("Queue has ended.");
    player.destroy();
  });

  client.musicManager.on("nodeReconnect", (node) => {
    client.logger.warn(`Node "${node.options.identifier}" is reconnecting`);
  });

  client.musicManager.on("trackError", (player, track, ex) => {
    client.logger.error(`Track Error ${ex.error}`, ex.exception);
    client.logger.debug({
      player,
      track,
    });
  });
};
