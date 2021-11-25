/**
 * @param {import('@src/structures').BotClient} client
 * @param {any} data
 */
module.exports = async (client, data) => {
  client.musicManager.updateVoiceState(data);
};
