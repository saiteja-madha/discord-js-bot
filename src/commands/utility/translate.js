const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { translate } = require('@helpers/HttpUtils')
const { GOOGLE_TRANSLATE } = require('@src/data.json')

// Discord limits to a maximum of 25 choices for slash command
// Add any 25 language codes from here: https://cloud.google.com/translate/docs/languages

const choices = [
  'ar',
  'cs',
  'de',
  'en',
  'fa',
  'fr',
  'hi',
  'hr',
  'it',
  'ja',
  'ko',
  'la',
  'nl',
  'pl',
  'ta',
  'te',
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'translate',
  description: 'translate from one language to other',
  cooldown: 20,
  category: 'UTILITY',
  botPermissions: ['EmbedLinks'],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'language',
        description: 'translation language',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: choices.map(choice => ({
          name: GOOGLE_TRANSLATE[choice],
          value: choice,
        })),
      },
      {
        name: 'text',
        description: 'the text that requires translation',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const outputCode = interaction.options.getString('language')
    const input = interaction.options.getString('text')
    const response = await getTranslation(interaction.user, input, outputCode)
    await interaction.followUp(response)
  },
}

async function getTranslation(author, input, outputCode) {
  const data = await translate(input, outputCode)
  if (!data) return 'Failed to translate your text'

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${author.username} says`,
      iconURL: author.avatarURL(),
    })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(data.output)
    .setFooter({
      text: `${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})`,
    })

  return { embeds: [embed] }
}
