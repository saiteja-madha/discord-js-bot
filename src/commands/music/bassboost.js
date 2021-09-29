const { Command } = require("@src/structures");
const { Message } = require("discord.js");

const levels = {
  none: 0.0,
  low: 0.1,
  medium: 0.15,
  high: 0.25,
};

module.exports = class Bassboost extends Command {
  constructor(client) {
    super(client, {
      name: "bassboost",
      description: "Toggles bassboost",
      command: {
        enabled: true,
        minArgsCount: 1,
        usage: "<none|low|medium|high>",
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
    const player = message.client.musicManager.get(message.guildId);
    if (!player) return message.reply("No music is being played!");

    const { channel } = message.member.voice;

    if (!channel) return message.reply("You need to join a voice channel.");
    if (channel.id !== player.voiceChannel) return message.reply("You're not in the same voice channel.");

    let level = "none";
    if (args.length && args[0].toLowerCase() in levels) level = args[0].toLowerCase();

    const bands = new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }));
    player.setEQ(...bands);

    return message.channel.send(`Set the bassboost level to ${level}`);
  }
};
