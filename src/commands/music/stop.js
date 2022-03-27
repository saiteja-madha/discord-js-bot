const { musicValidations } = require("@utils/botUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "stop",
  description: "stop the music player",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = stop(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = stop(interaction);
    await interaction.followUp(response);
  },
};

function stop({ client, guildId }) {
  const player = client.musicManager.get(guildId);
  player.destroy();
  return "🎶 The music player is stopped and queue has been cleared";
}
