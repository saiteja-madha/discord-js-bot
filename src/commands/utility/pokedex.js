const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pokedex",
  description: "shows pokemon information",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<pokemon>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pokemon",
        description: "pokemon name to get information for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const pokemon = args.join(" ");
    const response = await pokedex(pokemon);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const pokemon = interaction.options.getString("pokemon");
    const response = await pokedex(pokemon);
    await interaction.followUp(response);
  },
};

async function pokedex(pokemon) {
  const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
  if (response.status === 404) return "```The given pokemon is not found```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data[0];

  const embed = new EmbedBuilder()
    .setTitle(`Pokédex - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
      stripIndent`
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
    .setFooter({ text: json.description });

  return { embeds: [embed] };
}
