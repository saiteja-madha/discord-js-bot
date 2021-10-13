const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");

const API_KEY = process.env.WEATHERSTACK_KEY;

module.exports = class WeatherCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "weather",
      description: "get weather information",
      enabled: true,
      cooldown: 5,
      category: "UTILITY",
      options: [
        {
          name: "place",
          description: "country/city name to get weather information for",
          type: "STRING",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const place = interaction.options.getString("place");

    const response = await getJson(`http://api.weatherstack.com/current?access_key=${API_KEY}&query=${place}`);
    if (!response.success) return interaction.followUp(MESSAGES.API_ERROR);

    const json = response.data;
    if (!json.request) return interaction.followUp(`No city found matching \`${place}\``);

    const embed = buildEmbed(json);
    await interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = (json) => {
  const embed = new MessageEmbed()
    .setTitle("Weather")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.current?.weather_icons[0])
    .addField("City", json.location?.name || "NA", true)
    .addField("Region", json.location?.region || "NA", true)
    .addField("Country", json.location?.country || "NA", true)
    .addField("Weather condition", json.current?.weather_descriptions[0] || "NA", true)
    .addField("Date", json.location?.localtime.slice(0, 10) || "NA", true)
    .addField("Time", json.location?.localtime.slice(11, 16) || "NA", true)
    .addField("Temperature", `${json.current?.temperature}°C`, true)
    .addField("Cloudcover", `${json.current?.cloudcover}%`, true)
    .addField("Wind", `${json.current?.wind_speed} km/h`, true)
    .addField("Wind direction", json.current?.wind_dir || "NA", true)
    .addField("Pressure", `${json.current?.pressure} mb`, true)
    .addField("Precipitation", `${json.current?.precip.toString()} mm`, true)
    .addField("Humidity", json.current?.humidity.toString() || "NA", true)
    .addField("Visual distance", `${json.current?.visibility} km`, true)
    .addField("UV", json.current?.uv_index.toString() || "NA", true)
    .setFooter(`Last checked at ${json.current?.observation_time} GMT`);

  return embed;
};
