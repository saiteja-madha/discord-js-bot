const { Command, CommandContext } = require("@root/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, MESSAGES, EMBED_COLORS } = require("@root/config.json");
const { getResponse } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class Pokedex extends Command {
  constructor(client) {
    super(client, {
      name: "pokedex",
      description: "shows pokemon information",
      usage: "<pokemon>",
      minArgsCount: 1,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;

    const response = await getResponse(`https://pokeapi.glitch.me/v1/pokemon/${args}`);
    if (response.status === 404) return ctx.reply("```The given pokemon is not found```");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const json = response.data[0];
    if (!json) return;

    let embed = new MessageEmbed()
      .setTitle("Pokédex - " + json.name)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(json.sprite)
      .setDescription(
        outdent`
            ${EMOJIS.WHITE_DIAMOND_SUIT} **ID**: ${json.number}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Name**: ${json.name}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Species**: ${json.species}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Type(s)**: ${json.types}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Abilities(normal)**: ${json.abilities.normal}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Abilities(hidden)**: ${json.abilities.hidden}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Egg group(s)**: ${json.eggGroups}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Gender**: ${json.gender}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Height**: ${json.height} foot tall
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Weight**: ${json.weight}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Current Evolution Stage**: ${json.family.evolutionStage}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Evolution Line**: ${json.family.evolutionLine}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Is Starter?**: ${json.starter}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Is Legendary?**: ${json.legendary}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Is Mythical?**: ${json.mythical}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Is Generation?**: ${json.gen}
            `
      )
      .setFooter(json.description);

    ctx.reply({ embeds: [embed] });
  }
};
