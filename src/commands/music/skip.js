const { Command } = require("@src/structures");
const { Message } = require("discord.js");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skip the current song",
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

    if (!player.queue.current) return message.channel.send("There is no music playing.");

    const { title } = player.queue.current;

    player.stop();
    return message.channel.send(`${title} was skipped.`);
  }
};
