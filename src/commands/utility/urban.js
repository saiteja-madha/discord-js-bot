const { Command } = require("@src/structures");
const { MessageEmbed, Message } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
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
        enabled: false,
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const response = await getResponse(`http://api.urbandictionary.com/v0/define?term=${args}`);
    if (!response.success) return message.reply(MESSAGES.API_ERROR);

    const json = response.data;
    if (!json.list[0]) return message.reply(`Nothing found matching \`${args}\``);

    const data = json.list[0];
    const embed = new MessageEmbed()
      .setTitle(data.word)
      .setURL(data.permalink)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`**Definition**\`\`\`css\n${data.definition}\`\`\``)
      .addField("Author", data.author, true)
      .addField("ID", data.defid.toString(), true)
      .addField("\u200b", "\u200b", true)
      .addField("Example", data.example, true)
      .addField("Likes / Dislikes", `👍 ${data.thumbs_up} | 👎 ${data.thumbs_down}`, true)
      .addField("\u200b", "\u200b", true)
      .setFooter(`Created ${moment(data.written_on).fromNow()}`);

    message.channel.send({ embeds: [embed] });
  }
};
