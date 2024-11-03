const { autoplayFunction } = require('@handlers/player')
const { MUSIC } = require('@src/config')

module.exports = async (client, player, track) => {
  const guild = client.guilds.cache.get(player.guildId)
  if (!guild) return

  if (player.volume > 100) {
    await player.setVolume(MUSIC.DEFAULT_VOLUME)
  }

  const msg = player.get('message')
  if (msg && msg.deletable) {
    await msg.delete().catch(() => {})
  }

  if (player.get('autoplay') === true) {
    await autoplayFunction(client, track, player)
  }
}
