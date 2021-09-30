const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Stop extends Command {
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
    const player = message.client.musicManager.get(message.guild.id);
    if (!player) return message.channel.send("No music is being played!");

    const { channel: voice } = message.member.voice;

    if (!voice) return message.channel.send("You need to join a voice channel.");
    if (voice.id !== player.voiceChannel) return message.channel.send("You're not in the same voice channel.");

    player.destroy();
    return message.channel.send("The music player is stopped");
  }
};
