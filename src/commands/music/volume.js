const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "volume",
  description: "Set the music player volume",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["vol"],
    usage: "<0-100>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "amount",
        description: "Enter a value to set [0 to 100]",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const amount = parseInt(args[0]);
    const response = await getVolume(message, amount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = parseInt(interaction.options.getInteger("amount"));
    const response = await getVolume(interaction, amount);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function getVolume({ client, guildId }, amount) {
  const player = client.musicManager.getPlayer(guildId);

  if (!player || !player.queue.current) {
    return "🚫 There's no music currently playing";
  }

  if (!amount) return `> The player volume is \`${player.volume}\``;

  if (isNaN(amount) || amount < 0 || amount > 100) {
    return "You need to give me a volume between 0 and 100";
  }

  // Set the player volume
  await player.setVolume(amount);
  return `🎶 Music player volume is set to \`${amount}\``;
}
