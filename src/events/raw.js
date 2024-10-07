module.exports = async (client, data) => {
  client.manager.sendRawData(data);
};