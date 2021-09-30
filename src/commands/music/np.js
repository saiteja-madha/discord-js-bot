const { EMBED_COLORS } = require("@root/config");
const { Command } = require("@src/structures");
const { Message, MessageEmbed } = require("discord.js");
const prettyMs = require("pretty-ms");

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
    const player = message.client.musicManager.get(message.guild.id);
    if (!player || !player.queue.current) return message.channel.send("No music is being played!");

    let track = player.queue.current;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(track.displayThumbnail("hqdefault"))
      .setAuthor("Now playing")
      .setDescription(`[${track.title}](${track.uri})`)
      .addField("Song Duration", "`" + prettyMs(track.duration, { colonNotation: true }) + "`", true)
      .addField("Added By", track.requester.tag || "NA", true);

    message.channel.send({ embeds: [embed] });
  }
};
