const { MUSIC } = require("@root/config");

module.exports = async (client, data) => {
  if (MUSIC.ENABLED) {
    client.musicManager.sendRawData(data);
  }
};
