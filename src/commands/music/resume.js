const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "resume",
  description: "resumes the music player",
  category: "ERELA_JS",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = resumePlayer(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = resumePlayer(interaction);
    await interaction.followUp(response);
  },
};

function resumePlayer({ client, guildId }) {
  const player = client.erelaManager.get(guildId);
  if (!player.paused) return "The player is already resumed";
  player.pause(false);
  return "▶️ Resumed the music player";
}
