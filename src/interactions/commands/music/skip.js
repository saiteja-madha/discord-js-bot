const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { checkMusic } = require("@utils/botUtils");

module.exports = class Skip extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skip the current song",
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

    const { title } = player.queue.current;

    player.stop();
    await interaction.followUp(`⏯️ ${title} was skipped.`);
  }
};
