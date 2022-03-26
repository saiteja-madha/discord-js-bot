const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Shuffle extends Command {
  constructor(client) {
    super(client, {
      name: "shuffle",
      description: "shuffle the queue",
      category: "MUSIC",
      validations: musicValidations,
      command: {
        enabled: true,
      },
      slashCommand: {
        enabled: true,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const response = shuffle(message);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const response = shuffle(interaction);
    await interaction.followUp(response);
  }
};

function shuffle({ client, guildId }) {
  const player = client.musicManager.get(guildId);
  player.queue.shuffle();
  return "🎶 Queue has been shuffled";
}
