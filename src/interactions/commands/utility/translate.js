const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommand } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { translate } = require("@utils/httpUtils");
const { GOOGLE_TRANSLATE } = require("@src/data.json");

// Discord limits to a maximum of 25 choices for slash command
// Add any 25 language codes from here: https://cloud.google.com/translate/docs/languages

const choices = ["ar", "cs", "de", "en", "fa", "fr", "hi", "hr", "it", "ja", "ko", "la", "nl", "pl", "ta", "te"];

module.exports = class TranslateCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "translate",
      description: "translate from one language to other",
      enabled: true,
      cooldown: 10,
      category: "UTILITY",
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
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const outputCode = interaction.options.getString("language");
    const input = interaction.options.getString("text");

    const data = await translate(input, outputCode);
    if (!data) return interaction.followUp("Failed to translate your text");

    const embed = buildEmbed(interaction.user, data);
    await interaction.followUp({ embeds: [embed] });
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
