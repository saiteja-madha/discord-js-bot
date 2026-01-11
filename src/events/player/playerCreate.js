const { MUSIC } = require("@root/config");

module.exports = async (_, player) => {
  if (!player) return;

  const volume = MUSIC.DEFAULT_VOLUME;

  if (volume !== null && volume > 0) {
    await player.setVolume(volume);
  }
};
