const { EMBED_COLORS } = require("@root/config");
const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");

module.exports = class Queue extends Command {
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
    const player = message.client.musicManager.get(message.guild.id);
    if (!player) return message.channel.send("There is no music playing in this guild.");

    const queue = player.queue;
    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setAuthor(`Queue for ${message.guild.name}`);

    // change for the amount of tracks per page
    const multiple = 10;
    const page = args.length && Number(args[0]) ? Number(args[0]) : 1;

    const end = page * multiple;
    const start = end - multiple;

    const tracks = queue.slice(start, end);

    if (queue.current) embed.addField("Current", `[${queue.current.title}](${queue.current.uri})`);

    if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
    else embed.setDescription(tracks.map((track, i) => `${start + ++i} - [${track.title}](${track.uri})`).join("\n"));

    const maxPages = Math.ceil(queue.length / multiple);

    embed.setFooter(`Page ${page > maxPages ? maxPages : page} of ${maxPages}`);

    return message.channel.send({ embeds: [embed] });
  }
};
