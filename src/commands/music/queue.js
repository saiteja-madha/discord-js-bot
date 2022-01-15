const { EMBED_COLORS } = require("@root/config");
const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");

module.exports = class Queue extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "displays the current music queue",
      category: "MUSIC",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "[page]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "page",
            description: "page number",
            type: "INTEGER",
            required: false,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const page = args.length && Number(args[0]) ? Number(args[0]) : 1;
    const response = getQueue(message, page);
    await message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const page = interaction.options.getInteger("page");
    const response = getQueue(interaction, page);
    await interaction.followUp(response);
  }
};

function getQueue({ client, guild }, pgNo) {
  const player = client.musicManager.get(guild.id);
  if (!player) return "🚫 There is no music playing in this guild.";

  const queue = player.queue;
  const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setAuthor({ name: `Queue for ${guild.name}` });

  // change for the amount of tracks per page
  const multiple = 10;
  const page = pgNo || 1;

  const end = page * multiple;
  const start = end - multiple;

  const tracks = queue.slice(start, end);

  if (queue.current) embed.addField("Current", `[${queue.current.title}](${queue.current.uri})`);
  if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
  else embed.setDescription(tracks.map((track, i) => `${start + ++i} - [${track.title}](${track.uri})`).join("\n"));

  const maxPages = Math.ceil(queue.length / multiple);

  embed.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });

  return { embeds: [embed] };
}
