const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "skip the current song",
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
    const response = skip(message);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const response = skip(interaction);
    await interaction.followUp(response);
  }
};

function skip({ client, guildId }) {
  const player = client.musicManager.get(guildId);
  const { title } = player.queue.current;
  player.stop();
  return `⏯️ ${title} was skipped.`;
}
