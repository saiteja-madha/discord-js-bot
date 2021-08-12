const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.json");
const { getResponse } = require("@utils/httpUtils");
const moment = require("moment");

module.exports = class UrbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "urban",
      description: "searches the urban dictionary",
      usage: "<word>",
      minArgsCount: 1,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;

    const response = await getResponse(`http://api.urbandictionary.com/v0/define?term=${args}`);
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    let json = response.data;
    if (!json.list[0]) return ctx.reply(`Nothing found matching \`${args}\``);

    let data = json.list[0];
    let embed = new MessageEmbed()
      .setTitle(data.word)
      .setURL(data.permalink)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription("**Definition**```css\n" + data.definition + "```")
      .addField("Author", data.author, true)
      .addField("ID", data.defid.toString(), true)
      .addField("\u200b", "\u200b", true)
      .addField("Example", data.example, true)
      .addField("Likes / Dislikes", "👍 " + data.thumbs_up + " | 👎 " + data.thumbs_down, true)
      .addField("\u200b", "\u200b", true)
      .setFooter("Created " + moment(data.written_on).fromNow());

    ctx.reply({ embeds: [embed] });
  }
};
