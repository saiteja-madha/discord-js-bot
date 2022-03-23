const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
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
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        aliases: ["tr"],
        usage: "<iso-code> <message>",
        minArgsCount: 2,
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
    let embed = new MessageEmbed();
    const outputCode = args.shift();

    if (!GOOGLE_TRANSLATE[outputCode]) {
      embed
        .setColor(EMBED_COLORS.WARNING)
        .setDescription(
          "Invalid translation code. Visit [here](https://cloud.google.com/translate/docs/languages) to see list of supported translation codes"
        );
      return message.safeReply({ embeds: [embed] });
    }

    const input = args.join(" ");
    if (!input) message.safeReply("Provide some valid translation text");

    const response = await getTranslation(message.author, input, outputCode);
    await message.safeReply(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const outputCode = interaction.options.getString("language");
    const input = interaction.options.getString("text");
    const response = await getTranslation(interaction.user, input, outputCode);
    await interaction.followUp(response);
  }
};

async function getTranslation(author, input, outputCode) {
  const data = await translate(input, outputCode);
  if (!data) return "Failed to translate your text";

  const embed = new MessageEmbed()
    .setAuthor({
      name: `${author.username} says`,
      iconURL: author.avatarURL(),
    })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(data.output)
    .setFooter({ text: `${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})` });

  return { embeds: [embed] };
}
