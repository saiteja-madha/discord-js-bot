/**
 * @param {import('@src/structures').BotClient} client
 * @param {any} data
 */
module.exports = async (client, data) => {
  if (client.config.ERELA_JS.ENABLED) client.erelaManager.updateVoiceState(data);
};
