const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Bassboost extends Command {
  constructor(client) {
    super(client, {
      name: "bassboost",
      description: "Toggles bassboost",
      command: {
        enabled: true,
        category: "MUSIC",
      },
      slashCommand: {
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const queue = message.client.player.getQueue(message.guildId);
    if (!queue || !queue.playing) return message.channel.send("No music is being played!");

    await queue.setFilters({
      bassboost: !queue.getFiltersEnabled().includes("bassboost"),
      normalizer2: !queue.getFiltersEnabled().includes("bassboost"),
    });

    const embed = new MessageEmbed().setDescription(
      `🎵 | Bassboost ${queue.getFiltersEnabled().includes("bassboost") ? "Enabled | ✅" : "Disabled | ❌"}`
    );
    return message.channel.send({ embeds: [embed] });
  }
};
