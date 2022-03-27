const { musicValidations } = require("@utils/botUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "skip",
  description: "skip the current song",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = skip(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = skip(interaction);
    await interaction.followUp(response);
  },
};

function skip({ client, guildId }) {
  const player = client.musicManager.get(guildId);
  const { title } = player.queue.current;
  player.stop();
  return `⏯️ ${title} was skipped.`;
}
