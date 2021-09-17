const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Volume extends Command {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "set the music player volume",
      command: {
        enabled: true,
        usage: "<1-100>",
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
    const { channel } = message;
    const volume = args[0];

    const queue = this.client.player.getQueue(message.guild);
    if (!queue || !queue.playing) return channel.send("No music currently playing !");

    if (!volume) return channel.send(`Current volume is \`${queue.volume}\`%!`);
    if (isNaN(volume) || volume < 1 || volume > 100) return channel.send("Volume must be a number between 1 and 100!");

    if (!message.member.voice.channel) return channel.send("You're not in a voice channel !");

    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
      return channel.send("We are not in the same voice channel!");

    const success = queue.setVolume(volume);
    if (success) channel.send(`Volume set to \`${parseInt(volume)}%\` !`);
    else channel.send("Failed to set volume");
  }
};
