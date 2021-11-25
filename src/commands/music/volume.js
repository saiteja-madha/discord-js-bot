const { Command } = require("@src/structures");
const { Message, CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Volume extends Command {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "set the music player volume",
      category: "MUSIC",
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
            type: "INTEGER",
            required: false,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const amount = args[0];
    const response = volume(message, amount);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("amount");
    const response = volume(interaction, amount);
    await interaction.followUp(response);
  }
};

function volume({ client, guildId }, volume) {
  const player = client.musicManager.get(guildId);

  if (!volume) return `> The player volume is \`${player.volume}\`.`;
  if (volume < 1 || volume > 100) return "you need to give me a volume between 1 and 100.";

  player.setVolume(volume);
  return `🎶 Music player volume is set to \`${volume}\`.`;
}
