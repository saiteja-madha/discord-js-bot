const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");
const { EQList } = require("lavalink-client");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bassboost",
  description: "Set bassboost level",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["bb"],
    minArgsCount: 1,
    usage: "<none|low|medium|high>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "level",
        description: "bassboost level",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "High", value: "high" },
          { name: "Medium", value: "medium" },
          { name: "Low", value: "low" },
          { name: "Off", value: "off" },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    let level = "off";
    if (args.length) {
      const input = args[0].toLowerCase();
      if (["high", "medium", "low", "off"].includes(input)) {
        level = input;
      }
    }
    const response = await setBassBoost(message, level);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    let level = interaction.options.getString("level");
    const response = await setBassBoost(interaction, level);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} level
 */
async function setBassBoost({ client, guildId }, level) {
  const player = client.musicManager.getPlayer(guildId);

  if (!player || !player.queue.current) {
    return "🚫 No song is currently playing";
  }

  // Clear any existing EQ
  await player.filterManager.clearEQ();

  switch (level) {
    case "high":
      await player.filterManager.setEQ(EQList.BassboostHigh);
      break;
    case "medium":
      await player.filterManager.setEQ(EQList.BassboostMedium);
      break;
    case "low":
      await player.filterManager.setEQ(EQList.BassboostLow);
      break;
    case "off":
      await player.filterManager.clearEQ();
      break;
    default:
      return "Invalid bassboost level";
  }

  return `> Set the bassboost level to \`${level}\``;
}