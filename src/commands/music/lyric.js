const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");

const BASE_URL = "https://some-random-api.ml/lyrics";

module.exports = class Lyric extends Command {
  constructor(client) {
    super(client, {
      name: "lyric",
      description: "shows a Lyric of the song",
      cooldown: 5,
      category: "MUSIC",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "<Tittle - Song name>",
        minArgsCount: 1,
      },
      slashCommand: {
        enabled: false,
        options: [
          {
            name: "name",
            description: "Song Lyric",
            type: "STRING",
            required: true,
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
    const choice = args.join(" ");
    if (!choice) {
      return message.reply(`Invalid Lyric selected.`);
    }
    const response = await getLyric(message.author, choice);
    return message.reply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const choice = interaction.options.getString("name");
    const response = await getLyric(interaction.user, choice);
    await interaction.followUp(response);
  }
};

async function getLyric(user, choice) {
  const response = await getJson(`${BASE_URL}?title=${choice}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const thumbnail = response.data?.thumbnail.genius;
  const author = response.data?.author;
  const lyrics = response.data?.lyrics;
  const title = response.data?.title;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`${author} - ${title}`)
    .setThumbnail(thumbnail)
    .setDescription(lyrics)
    .setFooter({ text: `Requested By: ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

  return { embeds: [embed] };
}
