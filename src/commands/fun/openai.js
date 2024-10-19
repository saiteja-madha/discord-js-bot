const { ApplicationCommandOptionType } = require('discord.js')
const {
  handleSetupModal,
  handleChat,
  handleImageGeneration,
} = require('@root/src/handlers/openai')

module.exports = {
  name: 'openai',
  description: 'AI-powered commands using OpenAI',
  category: 'UTILITY',
  botPermissions: ['EmbedLinks'],
  testGuildOnly: true,
  slashCommand: {
    enabled: true,
    options: [
      {
        name: 'setup',
        description: 'Setup your OpenAI settings',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'chat',
        description: 'Chat with the AI',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'message',
            description: 'Your message to the AI',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: 'image',
        description: 'Generate an image using AI',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'prompt',
            description: 'Describe the image you want to generate',
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'setup') {
      return handleSetupModal(interaction)
    }

    await interaction.deferReply()

    let response

    if (subcommand === 'chat') {
      const query = interaction.options.getString('message')
      response = await handleChat(interaction.user, query)
    } else if (subcommand === 'image') {
      const prompt = interaction.options.getString('prompt')
      response = await handleImageGeneration(interaction.user, prompt)
    }

    await interaction.editReply(response)
  },
}
