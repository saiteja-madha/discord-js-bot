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
    const settings = data.settings;
    const response = await stop(message, settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const settings = data.settings;
    const response = await stop(interaction, settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function stop({ client, guildId }, settings) {
  const player = client.musicManager.getPlayer(guildId);
  if (settings.music.twenty_four_seven.enabled) {
    await client.musicManager.destroyPlayer(guildId);
  } else {
    player.disconnect();
    await client.musicManager.destroyPlayer(guildId);
  }
  return "🎶 The music player is stopped and queue has been cleared";
}

