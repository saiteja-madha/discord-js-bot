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

    const { channel } = message.member.voice;

    if (!channel) return message.reply("you need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return message.reply("you're not in the same voice channel.");
    if (!player.paused) return message.reply("the player is already resumed.");

    player.pause(false);
    return message.reply("resumed the player.");
  }
};
