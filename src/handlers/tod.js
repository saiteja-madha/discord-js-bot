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
  const customId = interaction.customId

  switch (customId) {
    case 'truthBtn':
      await sendQuestion(interaction, 'truth')
      break
    case 'dareBtn':
      await sendQuestion(interaction, 'dare')
      break
    case 'randomBtn':
      await sendRandomQuestion(interaction)
      break
  }
}

/**
 * @param {ButtonInteraction} interaction
 * @param {string} category
 */
async function sendQuestion(interaction, category) {
  await interaction.reply({
    content: 'Inaminit! Someone tell Maria I love her SFM...',
    ephemeral: true,
  })

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
      text: `Type: ${category} | QID: ${question.questionId} | Player: ${interaction.user.tag}`,
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

/**
 * @param {ButtonInteraction} interaction
 */
async function sendRandomQuestion(interaction) {
  await interaction.reply({
    content: 'Inaminit! Someone tell Maria I love her SFM...',
    ephemeral: true,
  })

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
      text: `Type: RANDOM | QID: ${question.questionId} | Player: ${interaction.user.tag}`,
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
