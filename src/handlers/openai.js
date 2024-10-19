const {
  EmbedBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')
const { EMBED_COLORS } = require('@root/config.js')
const { getUser, updateOpenAISettings } = require('@schemas/User')
const { Configuration, OpenAIApi } = require('openai')

async function handleSetupModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('openai_setup_modal')
    .setTitle('OpenAI Setup')

  const apiKeyInput = new TextInputBuilder()
    .setCustomId('api_key')
    .setLabel('OpenAI API Key')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const temperatureInput = new TextInputBuilder()
    .setCustomId('temperature')
    .setLabel('Temperature (0.0 - 1.0)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const imagineInput = new TextInputBuilder()
    .setCustomId('imagine')
    .setLabel('AI Personality')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)

  const maxTokensInput = new TextInputBuilder()
    .setCustomId('max_tokens')
    .setLabel('Max Tokens')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

  const firstActionRow = new ActionRowBuilder().addComponents(apiKeyInput)
  const secondActionRow = new ActionRowBuilder().addComponents(temperatureInput)
  const thirdActionRow = new ActionRowBuilder().addComponents(imagineInput)
  const fourthActionRow = new ActionRowBuilder().addComponents(maxTokensInput)

  modal.addComponents(
    firstActionRow,
    secondActionRow,
    thirdActionRow,
    fourthActionRow
  )

  await interaction.showModal(modal)
}

async function handleOpenAISetupModal(interaction) {
  const apiKey = interaction.fields.getTextInputValue('api_key')
  const temperature = parseFloat(
    interaction.fields.getTextInputValue('temperature')
  )
  const imagine = interaction.fields.getTextInputValue('imagine')
  const maxTokens = parseInt(interaction.fields.getTextInputValue('max_tokens'))

  if (isNaN(temperature) || temperature < 0 || temperature > 1) {
    return interaction.reply({
      content:
        'Invalid temperature value. Please enter a number between 0 and 1.',
      ephemeral: true,
    })
  }

  if (isNaN(maxTokens) || maxTokens < 1) {
    return interaction.reply({
      content: 'Invalid max tokens value. Please enter a positive integer.',
      ephemeral: true,
    })
  }

  const settings = {
    apiKey,
    temperature,
    imagine,
    maxTokens,
  }

  await updateOpenAISettings(interaction.user.id, settings)

  return interaction.reply({
    content: 'Your OpenAI settings have been updated successfully!',
    ephemeral: true,
  })
}

async function handleChat(user, query) {
  const userDb = await getUser(user)
  if (!userDb.openai.apiKey) {
    return 'Please setup your OpenAI API key first using the `ai setup` command.'
  }

  const configuration = new Configuration({
    apiKey: userDb.openai.apiKey,
  })
  const openai = new OpenAIApi(configuration)

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-002',
      prompt: `${userDb.openai.imagine}\n\nHuman: ${query}\nAI:`,
      temperature: userDb.openai.temperature,
      max_tokens: userDb.openai.maxTokens,
    })

    return completion.data.choices[0].text.trim()
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return 'An error occurred while processing your request. Please try again later.'
  }
}

async function handleImageGeneration(user, prompt) {
  const userDb = await getUser(user)
  if (!userDb.openai.apiKey) {
    return 'Please setup your OpenAI API key first using the `ai setup` command.'
  }

  const configuration = new Configuration({
    apiKey: userDb.openai.apiKey,
  })
  const openai = new OpenAIApi(configuration)

  try {
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: '512x512',
    })

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle('AI Generated Image')
      .setDescription(prompt)
      .setImage(response.data.data[0].url)
      .setFooter({ text: `Requested by ${user.tag}` })

    return { embeds: [embed] }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return 'An error occurred while generating the image. Please try again later.'
  }
}

module.exports = {
  handleSetupModal,
  handleOpenAISetupModal,
  handleChat,
  handleImageGeneration,
}
