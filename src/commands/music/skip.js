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

    if (!player.queue.current) return message.reply("there is no music playing.");

    const { title } = player.queue.current;

    player.stop();
    return message.reply(`${title} was skipped.`);
  }
};
