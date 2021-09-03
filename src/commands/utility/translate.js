const { MessageEmbed, Message, CommandInteraction, CommandInteractionOptionResolver } = require("discord.js");
const { Command } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { translate } = require("@utils/httpUtils");
const { GOOGLE_TRANSLATE } = require("@src/data.json");

// Discord limits to a maximum of 25 choices for slash command
// Add any 25 language codes from here: https://cloud.google.com/translate/docs/languages

const choices = ["ar", "cs", "de", "en", "fa", "fr", "hi", "hr", "it", "ja", "ko", "la", "nl", "pl", "ta", "te"];

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: "translate",
      description: "translate from one language to other",
      cooldown: 20,
      command: {
        enabled: true,
        aliases: ["tr"],
        usage: "<iso-code> <message>",
        minArgsCount: 2,
        category: "UTILITY",
        botPermissions: ["EMBED_LINKS"],
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "language",
            description: "translation language",
            type: "STRING",
            required: true,
            choices: choices.map((choice) => ({ name: GOOGLE_TRANSLATE[choice], value: choice })),
          },
          {
            name: "text",
            description: "the text that requires translation",
            type: "STRING",
            required: true,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const { author } = message;
    let embed = new MessageEmbed();
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

    embed = buildEmbed(author, data);
    message.channel.send({ embeds: [embed] });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async interactionRun(interaction, options) {
    const outputCode = options.getString("language");
    const input = options.getString("text");

    const data = await translate(input, outputCode);
    if (!data) return interaction.followUp("Failed to translate your text");

    const embed = buildEmbed(interaction.user, data);
    interaction.followUp({ embeds: [embed] });
  }
};

const buildEmbed = (author, data) => {
  const embed = new MessageEmbed()
    .setAuthor(`${author.username} says`, author.avatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(data.output)
    .setFooter(`${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})`);

  return embed;
};
