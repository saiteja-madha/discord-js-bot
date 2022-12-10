const { musicValidations } = require("@helpers/BotUtils");
const { LoopType } = require("@lavaclient/queue");
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

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {"queue"|"track"} type
 */
function toggleLoop({ client, guildId }, type) {
  const player = client.musicManager.getPlayer(guildId);

  // track
  if (type === "track") {
    player.queue.setLoop(LoopType.Song);
    return "Loop mode is set to `track`";
  }

  // queue
  else if (type === "queue") {
    player.queue.setLoop(1);
    return "Loop mode is set to `queue`";
  }
}
