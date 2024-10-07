const { musicValidations } = require("@helpers/BotUtils");
const { parseTime, formatTime } = require("@helpers/Utils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "seek",
  description: "sets the playing track's position to the specified position",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    usage: "<duration>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "time",
        description: "The time you want to seek to.",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const time = parseTime(args.join(" "));
    if (!time) {
      return await message.safeReply("Invalid time format. Use 1s, 1m, 1h");
    }
    const response = seekTo(message, time);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const time = parseTime(interaction.options.getString("time"));
    if (!time) {
      return await interaction.followUp("Invalid time format. Use 1s, 1m, 1h");
    }
    const response = seekTo(interaction, time);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} time
 */
function seekTo({ client, guildId }, time) {
  const player = client.manager.getPlayer(guildId);

  if (time > player.queue.current.length) {
    return "The duration you provide exceeds the duration of the current track";
  }

  player.seek(time);
  return `Seeked song duration to **${formatTime(time)}**`;
}