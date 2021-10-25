const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { musicValidations } = require("@utils/botUtils");

module.exports = class Volume extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "change or set the music player volume",
      enabled: true,
      category: "MUSIC",
      validations: musicValidations,
      options: [
        {
          name: "amount",
          description: "Enter a value to set [0 to 100]",
          type: "INTEGER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const player = interaction.client.musicManager.get(interaction.guildId);

    const volume = interaction.options.getInteger("amount");
    if (!volume) return interaction.followUp(`> The player volume is \`${player.volume}\`.`);
    if (volume < 1 || volume > 100) return interaction.followUp("you need to give me a volume between 1 and 100.");

    player.setVolume(volume);
    await interaction.followUp(`🎶 Music player volume is set to \`${volume}\`.`);
  }
};
