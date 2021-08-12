const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@root/structures");
const { MESSAGES, EMBED_COLORS } = require("@root/config.json");
const { getResponse } = require("@utils/httpUtils");
const timestampToDate = require("timestamp-to-date");

module.exports = class CovidCommand extends Command {
  constructor(client) {
    super(client, {
      name: "covid",
      description: "get covid statistics for a country",
      usage: "<country>",
      minArgsCount: 1,
      category: "UTILITY",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;
    const cntry = args[0];

    const response = await getResponse(`https://disease.sh/v2/countries/${cntry}`);

    if (response.status === 404) return ctx.reply("```css\nCountry with the provided name is not found```");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const data = response.data;
    const mg = timestampToDate(data?.updated, "dd.MM.yyyy at HH:mm");
    const embed = new MessageEmbed()
      .setTitle("Covid - " + data?.country)
      .setThumbnail(data?.countryInfo.flag)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .addField("Cases total", data?.cases.toString(), true)
      .addField("Cases today", data?.todayCases.toString(), true)
      .addField("Total deaths", data?.deaths.toString(), true)
      .addField("Deaths today", data?.todayDeaths.toString(), true)
      .addField("Recovered", data?.recovered.toString(), true)
      .addField("Active", data?.active.toString(), true)
      .addField("Critical stage", data?.critical.toString(), true)
      .addField("Cases per 1 million", data?.casesPerOneMillion.toString(), true)
      .addField("Deaths per 1 million", data?.deathsPerOneMillion.toString(), true)
      .setFooter("Last updated on " + mg);

    ctx.reply({ embeds: [embed] });
  }
};
