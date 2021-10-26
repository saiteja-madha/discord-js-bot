/**
 *
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Player} player
 * @param {import("erela.js").Track} track
 * @param {import("erela.js").TrackExceptionEvent} ex
 */
module.exports = (client, player, track, ex) => {
  client.logger.error(`Track Error ${ex.error}`, ex.exception);
  client.logger.debug({
    guild_id: player.guild,
    track,
  });
};
