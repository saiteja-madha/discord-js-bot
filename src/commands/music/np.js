const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "np",
      description: "SHow what is playing currently",
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

    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    const embed = new MessageEmbed()
      .setTitle("Currently Playing")
      .setDescription(
        `🎶 | **${queue.current.title}**! (\`${
          perc.progress == "Infinity" ? "Live" : perc.progress + "%"
        }\`)\n\n${progress.replace(/ 0:00/g, " ◉ LIVE")}`
      );
    return message.channel.send({ embeds: [embed] });
  }
};
