const { SlashCommand } = require("@src/structures");
const { MessageEmbed, CommandInteraction } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class PokedexCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "pokedex",
      description: "shows pokemon information",
      enabled: true,
      cooldown: 10,
      category: "UTILITY",
      options: [
        {
          name: "pokemon",
          description: "pokemon name to get information for",
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
    const pokemon = interaction.options.getString("pokemon");

    const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
    if (response.status === 404) return interaction.followUp("```The given pokemon is not found```");
    if (!response.success) return interaction.followUp(MESSAGES.API_ERROR);

    const json = response.data[0];
    if (!json) return;
    const embed = buildEmbed(json);

    await interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = (json) => {
  const embed = new MessageEmbed()
    .setTitle(`Pokédex - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
      outdent`
            ♢ **ID**: ${json.number}
            ♢ **Name**: ${json.name}
            ♢ **Species**: ${json.species}
            ♢ **Type(s)**: ${json.types}
            ♢ **Abilities(normal)**: ${json.abilities.normal}
            ♢ **Abilities(hidden)**: ${json.abilities.hidden}
            ♢ **Egg group(s)**: ${json.eggGroups}
            ♢ **Gender**: ${json.gender}
            ♢ **Height**: ${json.height} foot tall
            ♢ **Weight**: ${json.weight}
            ♢ **Current Evolution Stage**: ${json.family.evolutionStage}
            ♢ **Evolution Line**: ${json.family.evolutionLine}
            ♢ **Is Starter?**: ${json.starter}
            ♢ **Is Legendary?**: ${json.legendary}
            ♢ **Is Mythical?**: ${json.mythical}
            ♢ **Is Generation?**: ${json.gen}
            `
    )
    .setFooter(json.description);

  return embed;
};
