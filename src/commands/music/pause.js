const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Pause extends Command {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "Pause the current song",
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
    if (!player) return message.reply("No music is being played!");

    const { channel } = message.member.voice;

    if (!channel) return message.reply("you need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return message.reply("you're not in the same voice channel.");
    if (player.paused) return message.reply("the player is already paused.");

    player.pause(true);
    return message.reply("paused the player.");
  }
};
