const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leave",
  description: "Disconnects the bot from the voice channel",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["disconnect"],
    minArgsCount: 0,
    usage: "",
  },
  slashCommand: {
    enabled: true,
    options: [],
  },

  async messageRun(message, args) {
    const response = await leave(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await leave(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function leave({ client, guildId, member }) {
  const player = client.musicManager.getPlayer(guildId);
    
  player.destroy();
  return "👋 Disconnected from the voice channel";
}