const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "queue",
  description: "displays the current music queue",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "page",
        description: "page number",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async interactionRun(interaction) {
    const page = interaction.options.getInteger("page");
    const response = getQueue(interaction, page);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} pgNo
 */
function getQueue({ client, guild }, pgNo) {
  const player = client.musicManager.getPlayer(guild.id);
  if (!player) return "🚫 There is no music playing in this guild.";

  const queue = player.queue;
  const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setAuthor({ name: `Queue for ${guild.name}` });

  // change for the amount of tracks per page
  const multiple = 10;
  const page = pgNo || 1;

  const end = page * multiple;
  const start = end - multiple;

  const tracks = queue.tracks.slice(start, end);

  if (queue.current) embed.addFields({ name: "Current", value: `[${queue.current.title}](${queue.current.uri})` });
  if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : "the queue"}.`);
  else embed.setDescription(tracks.map((track, i) => `${start + ++i} - [${track.title}](${track.uri})`).join("\n"));

  const maxPages = Math.ceil(queue.tracks.length / multiple);

  embed.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });

  return { embeds: [embed] };
}
