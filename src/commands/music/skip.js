const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skip the current song",
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

    const currentTrack = queue.current;
    const success = queue.skip();

    const embed = new MessageEmbed().setDescription(
      success ? `⏭️ | Skipped **${currentTrack}**` : "❌ | Something went wrong!"
    );
    return message.channel.send({ embeds: [embed] });
  }
};
