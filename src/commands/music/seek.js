const { musicValidations } = require("@helpers/BotUtils");
const prettyMs = require("pretty-ms");
const { durationToMillis } = require("@helpers/Utils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "seek",
  description: "sets the playing track's position to the specified position",
  category: "ERELA_JS",
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
    const time = args.join(" ");
    const response = seekTo(message, time);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const time = interaction.options.getString("time");
    const response = seekTo(interaction, time);
    await interaction.followUp(response);
  },
};

function seekTo({ client, guildId }, time) {
  const player = client.erelaManager?.get(guildId);
  const seekTo = durationToMillis(time);

  if (seekTo > player.queue.current.duration) {
    return "The duration you provide exceeds the duration of the current track";
  }

  player.seek(seekTo);
  return `Seeked to ${prettyMs(seekTo, { colonNotation: true, secondsDecimalDigits: 0 })}`;
}
