const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "loop",
  description: "loops the song or queue",
  category: "ERELA_JS",
  validations: musicValidations,
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<queue|track>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        type: ApplicationCommandOptionType.String,
        description: "The entity you want to loop",
        required: false,
        choices: [
          {
            name: "queue",
            value: "queue",
          },
          {
            name: "track",
            value: "track",
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0].toLowerCase();
    const type = input === "queue" ? "queue" : "track";
    const response = toggleLoop(message, type);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const type = interaction.options.getString("type") || "track";
    const response = toggleLoop(interaction, type);
    await interaction.followUp(response);
  },
};

function toggleLoop({ client, guildId }, type) {
  const player = client.erelaManager.get(guildId);

  // track
  if (type === "track") {
    player.setTrackRepeat(!player.trackRepeat);
    return `Track loop ${player.trackRepeat ? "enabled" : "disabled"}`;
  }

  // queue
  else if (type === "queue") {
    player.setQueueRepeat(!player.queueRepeat);
    return `Queue loop ${player.queueRepeat ? "enabled" : "disabled"}`;
  }
}
