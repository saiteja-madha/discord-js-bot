const { Command } = require("@src/structures");
const { MessageEmbed, Message, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");
const moment = require("moment");

module.exports = class UrbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "urban",
      description: "searches the urban dictionary",
      cooldown: 5,
      command: {
        enabled: true,
        usage: "<word>",
        minArgsCount: 1,
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "word",
            description: "the word for which you want to urban meaning",
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
    const response = await getJson(`http://api.urbandictionary.com/v0/define?term=${args}`);
    if (!response.success) return message.reply(MESSAGES.API_ERROR);

    const json = response.data;
    if (!json.list[0]) return message.reply(`Nothing found matching \`${args}\``);

    const embed = buildEmbed(json);
    message.channel.send({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    const word = options.getString("word");

    const response = await getJson(`http://api.urbandictionary.com/v0/define?term=${word}`);
    if (!response.success) return interaction.followUp(MESSAGES.API_ERROR);

    const json = response.data;
    if (!json.list[0]) return interaction.followUp(`Nothing found matching \`${word}\``);

    const embed = buildEmbed(json);
    interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = (json) => {
  const data = json.list[0];
  const embed = new MessageEmbed()
    .setTitle(data.word)
    .setURL(data.permalink)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`**Definition**\`\`\`css\n${data.definition}\`\`\``)
    .addField("Author", data.author, true)
    .addField("ID", data.defid.toString(), true)
    .addField("Likes / Dislikes", `👍 ${data.thumbs_up} | 👎 ${data.thumbs_down}`, true)
    .addField("Example", data.example, false)
    .setFooter(`Created ${moment(data.written_on).fromNow()}`);

  return embed;
};
