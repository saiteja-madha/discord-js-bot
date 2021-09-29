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
    const player = message.client.musicManager.get(message.guild.id);

    if (!player) return message.reply("there is no player for this guild.");
    if (!args.length) return message.reply(`the player volume is \`${player.volume}\`.`);

    const { channel } = message.member.voice;

    if (!channel) return message.reply("you need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return message.reply("you're not in the same voice channel.");

    const volume = Number(args[0]);

    if (!volume || volume < 1 || volume > 100) return message.reply("you need to give me a volume between 1 and 100.");

    player.setVolume(volume);
    return message.reply(`set the player volume to \`${volume}\`.`);
  }
};
