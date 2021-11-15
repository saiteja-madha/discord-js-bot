/**
 * Emitted when a track has an error during playback.
 * @param {import("@src/structures").BotClient} client
 * @param {import("erela.js").Player} player
 * @param {import("erela.js").Track} track
 * @param {import("erela.js").TrackExceptionEvent} ex
 */
module.exports = (client, player, track, ex) => {
  client.logger.error(`Track Error ${ex.error}`);
  client.logger.debug(`[${player.guild}] Track Error`);
};
