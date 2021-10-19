const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { checkMusic } = require("@utils/botUtils");

module.exports = class ShuffleCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "shuffle",
      description: "shuffle the queue",
      enabled: true,
      category: "MUSIC",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const player = interaction.client.musicManager.get(interaction.guildId);

    const playable = checkMusic(member, player);
    if (typeof playable !== "boolean") return interaction.followUp(playable);

    player.queue.shuffle();
    await interaction.followUp("🎶 Queue has been shuffled");
  }
};
