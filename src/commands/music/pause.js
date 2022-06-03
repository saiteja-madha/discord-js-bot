const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pause",
  description: "pause the music player",
  category: "ERELA_JS",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = pause(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = pause(interaction);
    await interaction.followUp(response);
  },
};

function pause({ client, guildId }) {
  const player = client.erelaManager.get(guildId);
  if (player.paused) return "The player is already paused.";

  player.pause(true);
  return "⏸️ Paused the music player.";
}
