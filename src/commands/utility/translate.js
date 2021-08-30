const { MessageEmbed, Message } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { translate } = require("@utils/httpUtils");
const { GOOGLE_TRANSLATE } = require("@src/data.json");

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: "translate",
      description: "translate from one language to other",
      cooldown: 5,
      command: {
        enabled: true,
        aliases: ["tr"],
        usage: "<iso-code> <message>",
        minArgsCount: 2,
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
    const { author } = message;
    const embed = new MessageEmbed();
    const outputCode = args.shift();

    if (!GOOGLE_TRANSLATE[outputCode]) {
      embed
        .setColor(EMBED_COLORS.WARNING_EMBED)
        .setDescription(
          "Invalid translation code. Visit [here](https://cloud.google.com/translate/docs/languages) to see list of supported translation codes"
        );
      return message.reply({ embeds: [embed] });
    }

    const input = args.join(" ");
    if (!input) message.reply("Provide some valid translation text");

    const data = await translate(input, outputCode);
    if (!data) return message.reply("Failed to translate your text");

    embed
      .setAuthor(`${author.username} says`, author.avatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(data.output)
      .setFooter(`${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})`);

    message.channel.send({ embeds: [embed] });
  }
};
