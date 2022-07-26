const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "volume",
  description: "set the music player volume",
  category: "ERELA_JS",
  validations: musicValidations,
  command: {
    enabled: true,
    usage: "<1-100>",
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
    const amount = args[0];
    const response = volume(message, amount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("amount");
    const response = volume(interaction, amount);
    await interaction.followUp(response);
  },
};

function volume({ client, guildId }, volume) {
  const player = client.erelaManager.get(guildId);

  if (!volume) return `> The player volume is \`${player.volume}\`.`;
  if (volume < 1 || volume > 100) return "you need to give me a volume between 1 and 100.";

  player.setVolume(volume);
  return `🎶 Music player volume is set to \`${volume}\`.`;
}
