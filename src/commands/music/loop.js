const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "loop",
  description: "loops the song or queue",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["lp"],
    minArgsCount: 1,
    usage: "<queue|track|off>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        type: ApplicationCommandOptionType.String,
        description: "The entity you want to loop or disable loop",
        required: false,
        choices: [
          {
            name: "Track",
            value: "track",
          },
          {
            name: "Queue",
            value: "queue",
          },
          {
            name: "Off",
            value: "off",
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0].toLowerCase();
    const type = input === "queue" ? "queue" : input === "track" ? "track" : "off";
    const response = toggleLoop(message, type);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString("type") || "track";
    const response = toggleLoop(interaction, type);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {"queue"|"track"|"off"} type
 */
function toggleLoop({ client, guildId }, type) {
  const player = client.manager.getPlayer(guildId);

  if (!player) return "🚫 There is no music player for this guild.";

  // track
  if (type === "track") {
    player.setRepeatMode("track");
    return "Loop mode is set to `track`";
  }

  // queue
  else if (type === "queue") {
    if (player.queue.tracks.length > 1) {
      player.setRepeatMode("queue");
      return "Loop mode is set to `queue`";
    } else {
      return "🚫 Queue is too short to be looped";
    }
  }

  // off
  else if (type === "off") {
    player.setRepeatMode("off");
    return "Loop mode is disabled";
  }
}