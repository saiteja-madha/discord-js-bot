const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "Shows the current music queue",
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
    const queue = message.client.player.getQueue(message.guildId);
    if (!queue || !queue.playing) return message.channel.send("No music is being played!");
    if (!args[0] || isNaN(args[0])) args[0] = 1;

    const pageStart = 10 * (args[0] - 1);
    const pageEnd = pageStart + 10;
    const currentTrack = queue.current;

    const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
      return `${i + pageStart + 1}. **${m.title}** ([link](${m.url}))`;
    });

    const embed = new MessageEmbed()
      .setTitle(`Music Queue`)
      .setDescription(
        `${tracks.join("\n")}${
          queue.tracks.length > pageEnd ? `\n...${queue.tracks.length - pageEnd} more track(s)` : ""
        }`
      )
      .addField("Now Playing", `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))`);
    return message.channel.send({ embeds: [embed] });
  }
};
