const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Resume extends Command {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "Resumes the paused song",
      command: {
        enabled: true,
        category: "MUSIC",
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
    if (!player.paused) return message.channel.send("The player is already resumed");

    player.pause(false);
    return message.channel.send("Resumed the player");
  }
};
