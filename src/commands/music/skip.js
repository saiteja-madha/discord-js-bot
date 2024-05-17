const { musicValidations } = require("@helpers/BotUtils");

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
    aliases: ["next"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await skip(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await skip(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function skip({ client, guildId }) {
  const player = client.musicManager.players.resolve(guildId);

  // Check if current song is playing
  if (!player || !player.queue.current) {
    return "⏯️ There is no song currently being played";
  }

  // Ensure the title is properly defined
  const title = player.queue.current.info.title || "Unknown Track";
  const skipped = await player.queue.next();

  return skipped ? `⏯️ ${title} was skipped.` : "⏯️ There is no song to skip.";
}
