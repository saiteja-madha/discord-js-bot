const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@root/structures");
const { EMBED_COLORS, GOOGLE_TRANSLATE } = require("@root/config.json");
const { translate } = require("@utils/httpUtils");

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: "translate",
      description: "translate from one language to other",
      usage: "<iso-code> <message>",
      minArgsCount: 2,
      aliases: ["tr"],
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { author } = message;
    const embed = new MessageEmbed();
    const outputCode = args.shift();

    if (!GOOGLE_TRANSLATE[outputCode]) {
      embed
        .setColor(EMBED_COLORS.WARNING_EMBED)
        .setDescription(
          `Invalid translation code. Visit [here](https://cloud.google.com/translate/docs/languages) to see list of supported translation codes`
        );
      return ctx.reply({ embeds: [embed] });
    }

    const input = args.join(" ");
    if (!input) ctx.reply("Provide some valid translation text");

    const data = await translate(input, outputCode);
    if (!data) return ctx.reply("Failed to translate your text");

    embed
      .setAuthor(author.username + " says", author.avatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(data.output)
      .setFooter(`${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})`);

    ctx.reply({ embeds: [embed] });
  }
};
