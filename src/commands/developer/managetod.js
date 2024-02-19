// mtod.js
const { ApplicationCommandOptionType } = require('discord.js')
const { addQuestion, deleteQuestion } = require('@schemas/TruthOrDare')
const { EmbedBuilder } = require('discord.js')

const categories = [
  {
    name: 'Truth',
    value: 'truth',
  },
  {
    name: 'Dare',
    value: 'dare',
  },
  {
    name: 'Paranoia',
    value: 'paranoia',
  },
  {
    name: 'Never Have I Ever',
    value: 'nhie',
  },
  {
    name: 'Would you rather',
    value: 'wyr',
  },
  {
    name: 'Have you ever',
    value: 'hye',
  },
  {
    name: 'What would you do',
    value: 'wwyd',
  },
]

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: 'mtod',
  description: 'Manage Truth or Dare questions',
  category: 'DEV',
  enabled: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'add',
        description: 'Add a question',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'category',
            description: 'Category of the question',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: categories,
          },
          {
            name: 'question',
            description: 'The question to add',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'delete',
        description: 'Delete a question',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'category',
            description: 'Category of the question',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: categories,
          },
          {
            name: 'question_id',
            description: 'ID of the question to delete',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },
  async interactionRun(interaction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case 'add':
        const category = interaction.options.getString('category')
        const question = interaction.options.getString('question')
        const response = await addQuestion(category, question)
        await interaction.followUp(response)
        break
      case 'delete':
        const delCategory = interaction.options.getString('category')
        const questionId = interaction.options.getString('question_id')
        const delResponse = await deleteQuestion(delCategory, questionId)
        await interaction.followUp(delResponse)
        break
    }
  },
}
