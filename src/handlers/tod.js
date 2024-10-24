const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const { getQuestions } = require('@schemas/TruthOrDare')
const { getUser } = require('@schemas/User')
const { EMBED_COLORS } = require('@src/config')

async function handleTodButtonClick(interaction) {
  const user = await getUser(interaction.member.user)

  if (!user.profile?.age) {
    return interaction.reply({
      content:
        'Please set your age using `/user set` command first to play Truth or Dare!',
      ephemeral: true,
    })
  }

  // Get the current rating from the footer of the previous embed
  const currentEmbed = interaction.message.embeds[0]
  const footerText = currentEmbed.footer.text
  const currentRating = footerText.match(/Rating: ([^|]+)/)[1].trim()

  // Check R-rating requirements for button clicks
  if (currentRating === 'R') {
    if (user.profile.age < 18) {
      return interaction.reply({
        content: 'You must be 18 or older to view R-rated content.',
        ephemeral: true,
      })
    }

    if (!interaction.channel.nsfw) {
      return interaction.reply({
        content: 'R-rated content can only be viewed in NSFW channels.',
        ephemeral: true,
      })
    }
  }

  const customId = interaction.customId

  switch (customId) {
    case 'truthBtn':
      await sendQuestion(interaction, 'truth', user.profile.age, currentRating)
      break
    case 'dareBtn':
      await sendQuestion(interaction, 'dare', user.profile.age, currentRating)
      break
    case 'randomBtn':
      await sendRandomQuestion(interaction, user.profile.age, currentRating)
      break
  }
}

async function sendQuestion(interaction, category, userAge, requestedRating) {
  const questions = await getQuestions(1, category, userAge, requestedRating)
  if (questions.length === 0) {
    await interaction.reply({
      content: 'No questions available matching your criteria.',
      ephemeral: true,
    })
    return
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`TOD: ${category}`)
    .setDescription(
      `Alright ${interaction.user.tag};\n**${question.question}**\n \n \n \n \n`
    )
    .setFooter({
      text: `Type: ${category} | Rating: ${question.rating} | QID: ${question.questionId} | Player: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Truth'),
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('Dare'),
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('Random')
  )

  await interaction.reply({
    embeds: [embed],
    components: [buttons],
  })
}

async function sendRandomQuestion(interaction, userAge, requestedRating) {
  const questions = await getQuestions(1, 'random', userAge, requestedRating)
  if (questions.length === 0) {
    await interaction.reply({
      content: 'No questions available matching your criteria.',
      ephemeral: true,
    })
    return
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle('Random Truth or Dare')
    .setDescription(` \n**${question.question}**\n \n \n \n \n`)
    .setFooter({
      text: `Type: ${question.category} | Rating: ${question.rating} | QID: ${question.questionId} | Player: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Truth'),
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('Dare'),
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('Random')
  )

  await interaction.reply({ embeds: [embed], components: [buttons] })
}

module.exports = {
  handleTodButtonClick,
}
