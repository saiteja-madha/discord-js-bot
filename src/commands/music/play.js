const { Command } = require("@src/structures");
const { QueryType } = require("discord-player");
const { Message } = require("discord.js");

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "play a song from youtube",
      command: {
        enabled: true,
        usage: "<song-name>",
        minArgsCount: 1,
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
    const { guild, channel, member } = message;
    const query = args.join(" ");

    if (!member.voice.channel) return message.reply("You need to join a voice channel first");

    let searchResult;
    try {
      searchResult = await this.client.player.search(query, {
        requestedBy: message.author,
        searchEngine: QueryType.AUTO,
      });
    } catch (ex) {
      this.client.logger.error("Music Play", ex);
      message.channel.send("Failed to fetch results");
    }

    const queue = this.client.player.createQueue(guild, {
      metadata: channel,
    });

    try {
      if (!queue.connection) await queue.connect(member.voice.channel);
    } catch {
      this.client.player.deleteQueue(message.guildId);
      return message.channel.send("Could not join your voice channel!");
    }

    await message.channel.send(`⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...`);
    searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
  }
};
