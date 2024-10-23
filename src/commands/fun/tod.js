const {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')
const { getQuestions } = require('@schemas/TruthOrDare')
const { getUser } = require('@schemas/User')
const { EmbedBuilder } = require('discord.js')
const { handleTodButtonClick } = require('@handlers/tod')
const { EMBED_COLORS } = require('@root/config')

// Helper function to create rating choices
const getRatingChoices = () => [
  { name: 'PG - General Audience', value: 'PG' },
  { name: 'PG-13 - Teen', value: 'PG-13' },
  { name: 'PG-16 - Mature Teen', value: 'PG-16' },
  { name: 'R - Mature (NSFW)', value: 'R' },
]

// Helper function to create subcommand with rating option
const createSubcommandWithRating = (name, description) => ({
  name,
  description,
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'rating',
      description: 'Filter questions by rating (optional)',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: getRatingChoices(),
    },
  ],
})

module.exports = {
  name: 'tod',
  description: 'Play Truth or Dare!',
  category: 'FUN',
  global: true,
  slashCommand: {
    enabled: true,
    options: [
      createSubcommandWithRating('truth', 'Get a truth question'),
      createSubcommandWithRating('dare', 'Get a dare question'),
      createSubcommandWithRating('paranoia', 'Get a paranoia question'),
      createSubcommandWithRating('nhie', "Get a 'Never Have I Ever' question"),
      createSubcommandWithRating('wyr', "Get a 'Would you rather' question"),
      createSubcommandWithRating('hye', "Get a 'Have you ever' question"),
      createSubcommandWithRating('wwyd', "Get a 'What would you do' question"),
      createSubcommandWithRating('random', 'Get a random question'),
    ],
  },

  async interactionRun(interaction) {
    if (interaction.isButton()) {
      return handleTodButtonClick(interaction)
    }

    const subcommand = interaction.options.getSubcommand()
    const requestedRating = interaction.options.getString('rating')
    const user = await getUser(interaction.member.user)

    // Check if age is set
    if (!user.profile?.age) {
      return interaction.followUp({
        content:
          'Please set your age using `/profile set` command first to play Truth or Dare!',
        ephemeral: true,
      })
    }

    // Check for R-rated content requirements
    if (requestedRating === 'R') {
      if (user.profile.age < 18) {
        return interaction.followUp({
          content: 'You must be 18 or older to view R-rated content.',
          ephemeral: true,
        })
      }

      if (!interaction.channel.nsfw) {
        return interaction.followUp({
          content: 'R-rated content can only be viewed in NSFW channels.',
          ephemeral: true,
        })
      }
    }

    switch (subcommand) {
      case 'truth':
        sendQuestion(interaction, 'truth', user.profile.age, requestedRating)
        break
      case 'dare':
        sendQuestion(interaction, 'dare', user.profile.age, requestedRating)
        break
      case 'paranoia':
        sendQuestion(interaction, 'paranoia', user.profile.age, requestedRating)
        break
      case 'nhie':
        sendQuestion(interaction, 'nhie', user.profile.age, requestedRating)
        break
      case 'wyr':
        sendQuestion(interaction, 'wyr', user.profile.age, requestedRating)
        break
      case 'hye':
        sendQuestion(interaction, 'hye', user.profile.age, requestedRating)
        break
      case 'wwyd':
        sendQuestion(interaction, 'wwyd', user.profile.age, requestedRating)
        break
      case 'random':
        sendRandomQuestion(interaction, user.profile.age, requestedRating)
        break
    }
  },
}

async function sendQuestion(interaction, category, userAge, requestedRating) {
  const questions = await getQuestions(1, category, userAge, requestedRating)
  if (questions.length === 0) {
    await interaction.followUp('No questions available matching your criteria.')
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

  await interaction.followUp({
    embeds: [embed],
    components: [buttons],
  })
}

async function sendRandomQuestion(interaction, userAge, requestedRating) {
  const questions = await getQuestions(1, 'random', userAge, requestedRating)
  if (questions.length === 0) {
    await interaction.followUp('No questions available matching your criteria.')
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

  await interaction.followUp({ embeds: [embed], components: [buttons] })
}
