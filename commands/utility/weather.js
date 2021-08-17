const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");

const ACCESS_KEY = process.env.WEATHERSTACK_KEY;

module.exports = class WeatherCommand extends Command {
  constructor(client) {
    super(client, {
      name: "weather",
      description: "get weather information",
      usage: "<place>",
      minArgsCount: 1,
      category: "UTILITY",
      clientPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;
    const input = args.join(" ");

    const response = await getResponse(`http://api.weatherstack.com/current?access_key=${ACCESS_KEY}&query=${input}`);
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    let json = response.data;
    if (!json.request) return ctx.reply(`No city found matching \`${input}\``);

    let embed = new MessageEmbed()
      .setTitle("Weather")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(json.current?.weather_icons[0])
      .addField("City", json.location?.name, true)
      .addField("Region", json.location?.region, true)
      .addField("Country", json.location?.country, true)
      .addField("Weather condition", json.current?.weather_descriptions[0], true)
      .addField("Date", json.location?.localtime.slice(0, 10), true)
      .addField("Time", json.location?.localtime.slice(11, 16), true)
      .addField("Temperature", json.current?.temperature + "°C", true)
      .addField("Cloudcover", json.current?.cloudcover + "%", true)
      .addField("Wind", json.current?.wind_speed + " km/h", true)
      .addField("Wind direction", json.current?.wind_dir, true)
      .addField("Pressure", json.current?.pressure + " mb", true)
      .addField("Precipitation", json.current?.precip.toString() + " mm", true)
      .addField("Humidity", json.current?.humidity.toString(), true)
      .addField("Visual distance", json.current?.visibility + " km", true)
      .addField("UV", json.current?.uv_index.toString(), true)
      .setFooter("Last checked at " + json.current?.observation_time + " GMT");

    ctx.reply({ embeds: [embed] });
  }
};
