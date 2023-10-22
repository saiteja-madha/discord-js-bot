const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

const { getQuestions } = require('@schemas/TruthOrDare') // Import the getQuestions function

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTodButtonClick(interaction) {
  await interaction.deferUpdate()

  const customId = interaction.customId

  // Handle the button clicks based on their custom IDs
  if (customId === 'truthBtn') {
    sendQuestion(interaction, 'truth')
  } else if (customId === 'dareBtn') {
    sendQuestion(interaction, 'dare')
  } else if (customId === 'randomBtn') {
    sendRandomQuestion(interaction)
  }
}

async function sendQuestion(interaction, category) {
  const questions = await getQuestions(1, category)
  if (questions.length === 0) {
    await interaction.followUp(
      'No questions available in the specified category.'
    )
    return
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor('Blue')
    .setTitle(`TOD: ${category}`)
    .setDescription(
      `Alright ${interaction.user.tag};\n**${question.question}**\n \n \n \n \n`
    )
    .setFooter({
      text: `Type: ${category} | QID: ${question.questionId} | Requested by: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Truth')
  )

  buttons.addComponents(
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('Dare')
  )

  buttons.addComponents(
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('Random')
  )

  await interaction.followUp({
    embeds: [embed],
    components: [buttons],
  })
}

async function sendRandomQuestion(interaction) {
  const questions = await getQuestions(1)
  if (questions.length === 0) {
    await interaction.followUp('No questions available.')
    return
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor('Blue')
    .setTitle('Random Truth or Dare')
    .setDescription(` \n**${question.question}**\n \n \n \n \n`)
    .setFooter({
      text: `Type: RANDOM | QID: ${question.questionId} | Requested by: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Truth')
  )

  buttons.addComponents(
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('Dare')
  )

  buttons.addComponents(
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('Random')
  )

  await interaction.followUp({ embeds: [embed], components: [buttons] })
}

module.exports = {
  handleTodButtonClick,
}
