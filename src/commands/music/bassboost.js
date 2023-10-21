const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

const levels = {
  none: 0.0,
  low: 0.1,
  medium: 0.15,
  high: 0.25,
};

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bassboost",
  description: "set bassboost level",
  category: "MUSIC",
  validations: musicValidations,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "level",
        description: "bassboost level",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "none",
            value: "none",
          },
          {
            name: "low",
            value: "low",
          },
          {
            name: "medium",
            value: "medium",
          },
          {
            name: "high",
            value: "high",
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    let level = interaction.options.getString("level");
    const response = setBassBoost(interaction, level);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} level
 */
function setBassBoost({ client, guildId }, level) {
  const player = client.musicManager.getPlayer(guildId);
  const bands = new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }));
  player.setEqualizer(...bands);
  return `> Set the bassboost level to \`${level}\``;
}
