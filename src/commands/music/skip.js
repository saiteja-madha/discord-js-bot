const { EmbedBuilder } = require("discord.js");
const { musicValidations } = require("@helpers/BotUtils");

/*/**
 *
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "skip",
  description: "skip the current song",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["next", "s"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await skip(message);
    await message.safeReply({ embeds: [response] });
  },

  async interactionRun(interaction) {
    const response = await skip(interaction);
    await interaction.followUp({ embeds: [response] });
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function skip({ client, guildId }) {
  const player = client.manager.getPlayer(guildId);
  const embed = new EmbedBuilder().setColor(client.config.EMBED_COLORS.BOT_EMBED);

  // Check if there is a player and a song is currently playing
  if (!player || !player.queue.current) {
    return embed.setDescription("⏯️ There is no song currently being played");
  }

  const title = player.queue.current.info.title;
  // Check if there is a next song in the queue
  if (player.queue.tracks.length === 0) {
    return embed.setDescription("⏯️ There is no next song to skip to");
  }

  // Skip to the next song
  await player.skip();
  return embed.setDescription(`⏯️ ${title} was skipped`);
}