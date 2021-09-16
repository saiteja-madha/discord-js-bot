const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: "stop",
      description: "stop the music player",
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
    queue.destroy();
    return message.channel.send("Stopped the player!");
  }
};
