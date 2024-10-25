const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const { getQuestions } = require('@schemas/TruthOrDare')
const { getUser } = require('@schemas/User')
const { EMBED_COLORS } = require('../config')

async function handleTodButtonClick(interaction) {
  const user = await getUser(interaction.member.user)

  if (!user.profile?.age) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle('✦ hold up friend!')
          .setDescription(
            'i need to know your age first! use `/profile set` so we can play safely!'
          ),
      ],
      ephemeral: true,
    })
  }

  // Get the current rating from the footer of the previous embed
  const currentEmbed = interaction.message.embeds[0]
  const footerText = currentEmbed.data.footer.text
  const ratingMatch = footerText.match(/rating: ([^|]+)/i)
  const currentRating = ratingMatch ? ratingMatch[1].trim() : 'PG' // default to PG if no match

  // Check R-rating requirements for button clicks
  if (currentRating === 'R') {
    if (user.profile.age < 18) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setTitle('✦ oops, age check failed!')
            .setDescription(
              'sorry friend, that content is for the grown-ups only!'
            ),
        ],
        ephemeral: true,
      })
    }

    if (!interaction.channel.nsfw) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setTitle('✦ wrong place!')
            .setDescription(
              'psst! we need to be in an nsfw channel for that kind of fun!'
            ),
        ],
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
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle('✦ oh no!')
          .setDescription(
            "i searched everywhere but couldn't find any questions matching what you wanted!"
          ),
      ],
      ephemeral: true,
    })
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`✦ ${category.toUpperCase()} TIME!`)
    .setDescription(
      category === 'truth'
        ? `${interaction.user.username}, don't you lie!\n\n**${question.question}**\n`
        : category === 'dare'
          ? `${interaction.user.username}, don't chicken out!\n\n**${question.question}**\n`
          : `${interaction.user.username}, don't be scared!\n\n**${question.question}**\n`
    )
    .setFooter({
      text: `type: ${category} | rating: ${question.rating} | qid: ${question.questionId} | player: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('truth!'),
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('dare!'),
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('surprise me!')
  )

  await interaction.reply({
    embeds: [embed],
    components: [buttons],
  })
}

async function sendRandomQuestion(interaction, userAge, requestedRating) {
  const questions = await getQuestions(1, 'random', userAge, requestedRating)
  if (questions.length === 0) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setTitle('✦ oh no!')
          .setDescription(
            "i searched everywhere but couldn't find any questions matching what you wanted!"
          ),
      ],
      ephemeral: true,
    })
  }

  const question = questions[0]
  const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle('✦ RANDOM SURPRISE!')
    .setDescription(
      `ooh, this is gonna be fun! ready?\n\n**${question.question}**\n\nwhat's your next move?`
    )
    .setFooter({
      text: `type: ${question.category} | rating: ${question.rating} | qid: ${question.questionId} | player: ${interaction.user.tag}`,
    })

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('truthBtn')
      .setStyle(ButtonStyle.Primary)
      .setLabel('truth!'),
    new ButtonBuilder()
      .setCustomId('dareBtn')
      .setStyle(ButtonStyle.Success)
      .setLabel('dare!'),
    new ButtonBuilder()
      .setCustomId('randomBtn')
      .setStyle(ButtonStyle.Danger)
      .setLabel('surprise me!')
  )

  await interaction.reply({ embeds: [embed], components: [buttons] })
}

module.exports = {
  handleTodButtonClick,
}
