const { musicValidations } = require("@helpers/BotUtils");

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
    aliases: ["leave"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args, data) {
    const response = await stop(message, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await stop(interaction, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function stop({ client, guildId }, settings) {
  const player = client.manager.getPlayer(guildId);

  player.stopPlaying(true, false) // player.destroy();

  return "🎶 The music player is stopped and queue has been cleared";
}