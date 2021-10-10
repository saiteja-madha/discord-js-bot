const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");
const timestampToDate = require("timestamp-to-date");

module.exports = class CovidCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "covid",
      description: "get covid statistics for a country",
      enabled: true,
      cooldown: 10,
      options: [
        {
          name: "country",
          description: "country name to get covid statistics for",
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
    const country = interaction.options.getString("country");
    const response = await getJson(`https://disease.sh/v2/countries/${country}`);

    if (response.status === 404) return interaction.followUp("```css\nCountry with the provided name is not found```");
    if (!response.success) return interaction.followUp(MESSAGES.API_ERROR);

    const embed = buildEmbed(response);
    return interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = ({ data }) => {
  const mg = timestampToDate(data?.updated, "dd.MM.yyyy at HH:mm");
  const embed = new MessageEmbed()
    .setTitle(`Covid - ${data?.country}`)
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
    .setFooter(`Last updated on ${mg}`);

  return embed;
};
