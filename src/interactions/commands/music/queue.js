const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = class Queue extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "Shows the current music queue",
      enabled: true,
      options: [
        {
          name: "page",
          description: "page number",
          type: "INTEGER",
          required: false,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const player = interaction.client.musicManager.get(interaction.guildId);
    if (!player) return interaction.followUp("There is no music playing in this guild.");

    const queue = player.queue;
    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setAuthor(`Queue for ${interaction.guild.name}`);

    // change for the amount of tracks per page
    const multiple = 10;
    const page = interaction.options.getInteger("page") || 1;

    const end = page * multiple;
    const start = end - multiple;

    const tracks = queue.slice(start, end);

    if (queue.current) embed.addField("Current", `[${queue.current.title}](${queue.current.uri})`);

    if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
    else embed.setDescription(tracks.map((track, i) => `${start + ++i} - [${track.title}](${track.uri})`).join("\n"));

    const maxPages = Math.ceil(queue.length / multiple);

    embed.setFooter(`Page ${page > maxPages ? maxPages : page} of ${maxPages}`);

    return interaction.followUp({ embeds: [embed] });
  }
};
