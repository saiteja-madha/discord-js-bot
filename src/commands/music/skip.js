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

  async messageRun(message, args, data) {
    const response = skip(message, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = skip(interaction, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function skip({ client, guildId }, settings) {
  const player = client.musicManager.getPlayer(guildId);

  // check if current song is playing
  if (!player.queue.current) return "⏯️ There is no song currently being played";

  const { title } = player.queue.current;
  if (player.queue.tracks.length === 0) {
    if (settings.music.twenty_four_seven.enabled) {
       player.queue.clear();
       player.stop();
    } else {
       player.queue.clear();
       player.stop();
       player.disconnect();
			await client.musicManager.destroyPlayer(player.guildId);
    }
    return `⏯️ ${title} was skipped.`;
  }
  return player.queue.next() ? `⏯️ ${title} was skipped.` : "⏯️ There is no song to skip.";
}
