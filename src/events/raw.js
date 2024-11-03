module.exports = async (client, data) => {
  if (client.musicManager) {
    client.musicManager.sendRawData(data)
  }
}
