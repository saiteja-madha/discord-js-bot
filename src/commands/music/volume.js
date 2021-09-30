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
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const player = message.client.musicManager.get(message.guild.id);

    if (!player) return message.channel.send("No music is being played!");
    if (!args.length) return message.channel.send(`> The player volume is \`${player.volume}\`.`);

    const { channel: voice } = message.member.voice;

    if (!voice) return message.channel.send("You need to join a voice channel.");
    if (voice.id !== player.voiceChannel) return message.channel.send("You're not in the same voice channel.");

    const volume = Number(args[0]);

    if (!volume || volume < 1 || volume > 100)
      return message.channel.send("you need to give me a volume between 1 and 100.");

    player.setVolume(volume);
    return message.channel.send(`> Music player volume to \`${volume}\`.`);
  }
};
